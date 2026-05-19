from sqlalchemy import Column, Integer, String, Enum, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    learner = "learner"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)

    # Nullable to support SSO users who authenticate via Microsoft Azure AD
    # and do not have a local password.
    password_hash = Column(String(255), nullable=True)

    full_name = Column(String(150), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.learner, nullable=False)
    is_active = Column(Boolean, default=True)

    # SSO provider identifier: "microsoft" | None (regular password login)
    sso_provider = Column(String(50), nullable=True, default=None)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
