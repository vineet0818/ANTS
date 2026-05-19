import json
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models.user import User, UserRole
from models.profile import Profile
from models.roadmap import RoadmapModule, ProfileModule
from services.auth_service import hash_password

def run():
    db = SessionLocal()
    # Seed admin if not exists
    admin = db.query(User).filter(User.email == "admin@nousinfo.com").first()
    if not admin:
        admin = User(
            email="admin@nousinfo.com",
            password_hash=hash_password("Admin@123"),
            full_name="Platform Admin",
            role=UserRole.admin
        )
        db.add(admin)

    # Load course matrix and seed modules + profile_modules
    with open("course_matrix.json", encoding="utf-8") as f:
        matrix = json.load(f)["courses"]

    for course in matrix:
        # Insert module
        mod = db.query(RoadmapModule).filter(RoadmapModule.course_id == course["course_id"]).first()
        if not mod:
            mod = RoadmapModule(
                course_id=course["course_id"],
                title=course["title"],
                category=course["category"],
                mandatory=course["mandatory"],
                resource_name=course.get("resource_name"),
                platform=course.get("platform"),
                resource_link=course["resource_link"],
                estimated_time=course.get("estimated_time"),
                module_type=course.get("type", "course")
            )
            db.add(mod)
            db.flush()

        # Assign to profiles
        for pa in course["profile_assignments"]:
            profile = db.query(Profile).filter(Profile.profile_key == pa["profile_key"]).first()
            if profile:
                existing = db.query(ProfileModule).filter(
                    ProfileModule.profile_id == profile.id,
                    ProfileModule.module_id == mod.id
                ).first()
                if not existing:
                    pm = ProfileModule(
                        profile_id=profile.id,
                        module_id=mod.id,
                        sequence_order=pa["sequence_order"]
                    )
                    db.add(pm)

    db.commit()
    db.close()