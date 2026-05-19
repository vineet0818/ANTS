import bcrypt
import httpx
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from models.user import User, UserRole
from schemas.auth import UserRegister
from config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_REDIRECT_URI,
    AZURE_TOKEN_URL,
    AZURE_GRAPH_URL,
    ALLOWED_EMAIL_DOMAIN,
)


# ── Password utilities ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using bcrypt and return the hash as a string."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── JWT utilities ─────────────────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def register_user(db: Session, user_data: UserRegister) -> User:
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=UserRole.learner,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── SSO: Microsoft Azure AD ───────────────────────────────────────────────────

def exchange_microsoft_code(code: str) -> dict:
    """Exchange an authorization code for an access token from Microsoft."""
    payload = {
        "client_id": AZURE_CLIENT_ID,
        "client_secret": AZURE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": AZURE_REDIRECT_URI,
        "grant_type": "authorization_code",
        "scope": "openid profile email User.Read",
    }
    response = httpx.post(AZURE_TOKEN_URL, data=payload, timeout=10)
    response.raise_for_status()
    return response.json()


def get_microsoft_user_profile(access_token: str) -> dict:
    """Fetch the signed-in user's profile from Microsoft Graph."""
    headers = {"Authorization": f"Bearer {access_token}"}
    response = httpx.get(AZURE_GRAPH_URL, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json()


def get_or_create_sso_user(db: Session, profile: dict) -> User:
    """
    Find an existing user by email or create a new one from their
    Microsoft profile. Only @nousinfo.com addresses are accepted.

    Graph API returns fields like:
      mail / userPrincipalName  → email
      displayName               → full name
    """
    email = (profile.get("mail") or profile.get("userPrincipalName", "")).lower()

    if not email:
        raise ValueError("Microsoft profile did not return a valid email address.")

    domain = email.split("@")[-1]
    if domain != ALLOWED_EMAIL_DOMAIN:
        raise ValueError(
            f"SSO login is restricted to @{ALLOWED_EMAIL_DOMAIN} accounts."
        )

    user = get_user_by_email(db, email)

    if user:
        # Update SSO provider tag if user previously registered via password
        if user.sso_provider != "microsoft":
            user.sso_provider = "microsoft"
            db.commit()
            db.refresh(user)
        return user

    # First-time SSO login — auto-provision a new account
    full_name = profile.get("displayName") or email.split("@")[0]
    user = User(
        email=email,
        password_hash=None,          # SSO users have no local password
        full_name=full_name,
        role=UserRole.learner,
        sso_provider="microsoft",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
