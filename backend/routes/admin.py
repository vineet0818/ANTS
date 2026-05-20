from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from database import get_db
from models.user import User, UserRole
from models.profile import UserProfile, ProfileState, Profile
from models.progress import ModuleProgressCurrent, ProgressEvent, ProgressState, AdminAuditLog
from models.roadmap import ProfileModule, RoadmapModule
from middleware.auth_middleware import admin_required

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _risk_flag(completion_pct: int, start_date, target_date) -> str:
    """Return 'overdue' | 'at_risk' | 'on_track' | 'completed'"""
    if completion_pct >= 100:
        return "completed"
    today = date.today()
    if isinstance(target_date, str):
        target_date = date.fromisoformat(target_date)
    if isinstance(start_date, str):
        start_date = date.fromisoformat(start_date)
    if today > target_date:
        return "overdue"
    total_days = max((target_date - start_date).days, 1)
    elapsed_days = (today - start_date).days
    expected_pct = min(100, int((elapsed_days / total_days) * 100))
    if completion_pct < expected_pct - 20:
        return "at_risk"
    return "on_track"


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    learners = db.query(User).filter(User.role == UserRole.learner, User.is_active == True).all()
    result = []
    for user in learners:
        user_profile = db.query(UserProfile).filter(
            UserProfile.user_id == user.id,
            UserProfile.current_state == ProfileState.active
        ).first()
        if not user_profile:
            user_profile = db.query(UserProfile).filter(
                UserProfile.user_id == user.id
            ).order_by(UserProfile.updated_at.desc()).first()

        # Show users even if they haven't selected a profile yet
        profile = None
        total_modules = 0
        completed_modules = 0
        in_progress_modules = 0
        pct = 0
        risk = "on_track"
        start_date_str = str(user.created_at.date()) if user.created_at else str(date.today())
        target_date_str = "—"
        roadmap_state = "not_started"

        if user_profile:
            profile = db.query(Profile).filter(Profile.id == user_profile.profile_id).first()
            total_modules = db.query(func.count()).filter(
                ProfileModule.profile_id == user_profile.profile_id
            ).scalar() or 0
            completed_modules = db.query(func.count()).filter(
                ModuleProgressCurrent.user_id == user.id,
                ModuleProgressCurrent.progress_state == ProgressState.completed
            ).scalar() or 0
            in_progress_modules = db.query(func.count()).filter(
                ModuleProgressCurrent.user_id == user.id,
                ModuleProgressCurrent.progress_state == ProgressState.in_progress
            ).scalar() or 0
            pct = int((completed_modules / total_modules) * 100) if total_modules > 0 else 0
            risk = _risk_flag(pct, user_profile.start_date, user_profile.target_end_date)
            start_date_str = str(user_profile.start_date)
            target_date_str = str(user_profile.target_end_date)
            roadmap_state = str(user_profile.current_state)

        # Last activity timestamp
        last_event = db.query(ProgressEvent).filter(
            ProgressEvent.user_id == user.id
        ).order_by(ProgressEvent.created_at.desc()).first()

        result.append({
            "user_id": user.id,
            "name": user.full_name,
            "email": user.email,
            "profile_name": profile.name if profile else "No profile",
            "profile_key": profile.profile_key if profile else "",
            "completion_pct": pct,
            "completed_modules": completed_modules,
            "in_progress_modules": in_progress_modules,
            "total_modules": total_modules,
            "target_date": target_date_str,
            "start_date": start_date_str,
            "roadmap_state": roadmap_state,
            "risk_flag": risk,
            "last_activity": str(last_event.created_at) if last_event else None,
        })
    return result


@router.get("/learner/{user_id}")
def get_learner_detail(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id,
        UserProfile.current_state == ProfileState.active
    ).first()
    if not user_profile:
        user_profile = db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).order_by(UserProfile.updated_at.desc()).first()

    profile = db.query(Profile).filter(Profile.id == user_profile.profile_id).first() if user_profile else None

    # Full module list with progress
    modules_raw = db.query(ProfileModule, RoadmapModule).join(
        RoadmapModule, ProfileModule.module_id == RoadmapModule.id
    ).filter(
        ProfileModule.profile_id == (user_profile.profile_id if user_profile else -1)
    ).order_by(ProfileModule.sequence_order).all()

    module_progress = {
        mp.module_id: mp for mp in db.query(ModuleProgressCurrent).filter(
            ModuleProgressCurrent.user_id == user_id
        ).all()
    }

    modules = []
    for pm, rm in modules_raw:
        mp = module_progress.get(rm.id)
        modules.append({
            "module_id": rm.id,
            "title": rm.title,
            "category": rm.category,
            "resource_name": rm.resource_name,
            "resource_link": rm.resource_link,
            "estimated_time": rm.estimated_time,
            "progress_state": mp.progress_state if mp else "not_started",
            "percentage": mp.percentage if mp else 0,
            "updated_at": str(mp.updated_at) if mp else None,
        })

    # Progress event log (last 50)
    events = db.query(ProgressEvent, RoadmapModule).join(
        RoadmapModule, ProgressEvent.module_id == RoadmapModule.id
    ).filter(
        ProgressEvent.user_id == user_id
    ).order_by(ProgressEvent.created_at.desc()).limit(50).all()

    event_log = [{
        "event_id": ev.id,
        "module_title": rm.title,
        "event_type": ev.event_type,
        "old_state": ev.old_progress_state,
        "new_state": ev.new_progress_state,
        "percentage": ev.percentage,
        "created_at": str(ev.created_at),
    } for ev, rm in events]

    # Nudge history
    nudges = db.query(AdminAuditLog).filter(
        AdminAuditLog.entity_id == user_id,
        AdminAuditLog.action == "nudge"
    ).order_by(AdminAuditLog.created_at.desc()).limit(10).all()

    pct = int((sum(1 for m in modules if m["progress_state"] == "completed") / len(modules)) * 100) if modules else 0

    return {
        "user_id": user.id,
        "name": user.full_name,
        "email": user.email,
        "profile_name": profile.name if profile else "No profile",
        "completion_pct": pct,
        "total_modules": len(modules),
        "target_date": str(user_profile.target_end_date) if user_profile else None,
        "start_date": str(user_profile.start_date) if user_profile else None,
        "risk_flag": _risk_flag(pct, user_profile.start_date if user_profile else date.today(), user_profile.target_end_date if user_profile else date.today()),
        "modules": modules,
        "event_log": event_log,
        "nudge_history": [{"created_at": str(n.created_at), "details": n.details} for n in nudges],
    }


@router.post("/nudge/{user_id}")
def nudge_learner(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log = AdminAuditLog(
        admin_id=current_user.id,
        action="nudge",
        entity_type="user",
        entity_id=user_id,
        details={
            "nudged_by": current_user.email,
            "nudged_user": user.email,
            "nudged_at": datetime.utcnow().isoformat(),
            "message": "Admin sent a nudge to encourage progress."
        }
    )
    db.add(log)
    db.commit()
    return {"message": f"Nudge logged for {user.email}"}
