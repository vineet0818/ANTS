import json
from datetime import date, timedelta
from sqlalchemy.orm import Session
from models.profile import Profile, UserProfile, ProfileState
from models.roadmap import RoadmapModule, ProfileModule
from models.progress import ModuleProgressCurrent, ProgressState
from models.user import User

# Load course matrix once
with open("course_matrix.json", encoding="utf-8") as f:
    COURSE_MATRIX = json.load(f)["courses"]

def get_profiles(db: Session):
    return db.query(Profile).order_by(Profile.sort_order).all()

def assign_profile(db: Session, user_id: int, profile_id: int):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise ValueError("Profile not found")

    # Deactivate any existing active profile for this user
    db.query(UserProfile).filter(
        UserProfile.user_id == user_id,
        UserProfile.current_state == ProfileState.active
    ).update({"current_state": ProfileState.completed})

    weeks = (profile.default_duration_weeks_min + profile.default_duration_weeks_max) // 2
    start = date.today()
    end = start + timedelta(weeks=weeks)

    user_profile = UserProfile(
        user_id=user_id,
        profile_id=profile_id,
        current_state=ProfileState.active,
        start_date=start,
        target_end_date=end
    )
    db.add(user_profile)

    # Fetch all modules for the selected profile, ordered by sequence
    modules = db.query(RoadmapModule).join(ProfileModule).filter(
        ProfileModule.profile_id == profile.id
    ).order_by(ProfileModule.sequence_order).all()

    # Seed initial progress records — only for modules the user has NOT touched before.
    # Using db.merge() would reset existing progress, breaking cross-profile carry-over.
    # Instead we check first and only insert missing records.
    existing_module_ids = {
        row.module_id for row in
        db.query(ModuleProgressCurrent.module_id).filter(
            ModuleProgressCurrent.user_id == user_id
        ).all()
    }
    for mod in modules:
        if mod.id not in existing_module_ids:
            db.add(ModuleProgressCurrent(
                user_id=user_id,
                module_id=mod.id,
                progress_state=ProgressState.not_started,
                percentage=0
            ))

    db.commit()
    return user_profile

def get_modules_for_profile(profile_key: str):
    """Return all RoadmapModule objects for a profile, ordered by sequence."""
    # In a real implementation we'd query DB via join. Here we simulate.
    # We'll load from DB after seeding. But for MVP we can use in-memory JSON + DB query.
    pass  # Will be implemented in routes using DB join