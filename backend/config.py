import os

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqldb://root:Nous%4012345@localhost:3306/nousqa_platform",
)

# ── JWT ───────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "51ab3d33d2d3b702262ea02321909c0844955fca0b8381bcec632af956618ac1",
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

# ── Domain restriction ────────────────────────────────────────────────────────
ALLOWED_EMAIL_DOMAIN = os.getenv("ALLOWED_EMAIL_DOMAIN", "nousinfo.com")

# ── SSO / Microsoft Azure AD ──────────────────────────────────────────────────
# Set SSO_ENABLED=true in your environment to activate SSO login.
SSO_ENABLED = os.getenv("SSO_ENABLED", "false").lower() == "true"

# Azure AD (Entra ID) application settings.
# Register an app at https://portal.azure.com → Azure Active Directory → App registrations.
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID", "")          # e.g. "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID", "")          # Application (client) ID
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET", "")  # Client secret value

# The redirect URI must be registered in your Azure AD app.
# For local dev: http://localhost:8000/api/auth/sso/callback
AZURE_REDIRECT_URI = os.getenv(
    "AZURE_REDIRECT_URI", "http://localhost:8000/api/auth/sso/callback"
)

# After SSO, the backend redirects the browser here with the JWT token.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Derived Azure AD OAuth2 endpoints
AZURE_AUTHORITY = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}"
AZURE_AUTH_URL = f"{AZURE_AUTHORITY}/oauth2/v2.0/authorize"
AZURE_TOKEN_URL = f"{AZURE_AUTHORITY}/oauth2/v2.0/token"
AZURE_GRAPH_URL = "https://graph.microsoft.com/v1.0/me"
