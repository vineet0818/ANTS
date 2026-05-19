from pydantic import BaseModel, EmailStr, field_validator

ALLOWED_DOMAIN = "nousinfo.com"


def validate_nousinfo_email(email: str) -> str:
    """Enforce that the email belongs to the nousinfo.com domain."""
    domain = email.split("@")[-1].lower()
    if domain != ALLOWED_DOMAIN:
        raise ValueError(
            f"Only @{ALLOWED_DOMAIN} email addresses are allowed on this platform."
        )
    return email.lower()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("email")
    @classmethod
    def email_must_be_nousinfo(cls, v: str) -> str:
        return validate_nousinfo_email(v)


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def email_must_be_nousinfo(cls, v: str) -> str:
        return validate_nousinfo_email(v)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    full_name: str
    full_name: str
