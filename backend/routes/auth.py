import secrets
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth import UserRegister, UserLogin, Token
from services.auth_service import (
    register_user,
    get_user_by_email,
    verify_password,
    create_access_token,
    exchange_microsoft_code,
    get_microsoft_user_profile,
    get_or_create_sso_user,
)
from config import (
    SSO_ENABLED,
    AZURE_AUTH_URL,
    AZURE_CLIENT_ID,
    AZURE_REDIRECT_URI,
    FRONTEND_URL,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Standard email/password auth ──────────────────────────────────────────────

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user. Only @nousinfo.com addresses are accepted."""
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered.")
    user = register_user(db, data)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
    }


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password. Only @nousinfo.com addresses are accepted."""
    user = get_user_by_email(db, data.email)
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
    }


# ── SSO: Microsoft Azure AD ───────────────────────────────────────────────────

@router.get("/sso/login")
def sso_login():
    """
    Returns the Microsoft Azure AD authorization URL.
    The frontend redirects the user to this URL to initiate SSO.
    """
    if not SSO_ENABLED:
        raise HTTPException(status_code=400, detail="SSO is not enabled on this server.")

    # CSRF protection: random state token validated in the callback
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": AZURE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": AZURE_REDIRECT_URI,
        "response_mode": "query",
        "scope": "openid profile email User.Read",
        "state": state,
        # Prompt for account selection on every SSO click for clarity
        "prompt": "select_account",
    }

    auth_url = f"{AZURE_AUTH_URL}?{urlencode(params)}"
    return {"redirect_url": auth_url, "state": state}


@router.get("/sso/callback")
def sso_callback(
    code: str = Query(..., description="Authorization code from Azure AD"),
    state: str = Query(None),
    error: str = Query(None),
    error_description: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    Azure AD redirects the browser here after the user authenticates.
    Exchanges the code for an access token, fetches the user profile,
    provisions/finds the user in the DB, and redirects the browser to
    the frontend with a short-lived JWT in the URL.
    """
    if not SSO_ENABLED:
        raise HTTPException(status_code=400, detail="SSO is not enabled.")

    if error:
        # Redirect to frontend with a descriptive error message
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/callback?error={error}&error_description={error_description or ''}"
        )

    try:
        token_data = exchange_microsoft_code(code)
        ms_access_token = token_data.get("access_token")
        if not ms_access_token:
            raise ValueError("No access token returned from Microsoft.")

        profile = get_microsoft_user_profile(ms_access_token)
        user = get_or_create_sso_user(db, profile)

        jwt_token = create_access_token({"sub": str(user.id), "role": user.role})

        # Redirect the browser back to the frontend with the JWT
        from urllib.parse import quote
        redirect_url = (
            f"{FRONTEND_URL}/auth/callback"
            f"?token={jwt_token}"
            f"&user_id={user.id}"
            f"&role={user.role}"
            f"&full_name={quote(user.full_name)}"
        )
        return RedirectResponse(redirect_url)

    except ValueError as exc:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/callback?error=sso_failed&error_description={str(exc)}"
        )
    except Exception as exc:
        return RedirectResponse(
            f"{FRONTEND_URL}/auth/callback?error=server_error&error_description=An+unexpected+error+occurred."
        )
