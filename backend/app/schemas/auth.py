from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
import re

USERNAME_PATTERN = re.compile(r"^[a-z0-9_][a-z0-9_.]{2,29}$")


def validate_strong_password(value: str, label: str = "Password") -> str:
    if len(value) < 8:
        raise ValueError(f"{label} must be at least 8 characters.")
    if len(value) > 100:
        raise ValueError(f"{label} must be 100 characters or less.")
    if not re.search(r"[a-z]", value):
        raise ValueError(f"{label} must include one lowercase letter.")
    if not re.search(r"[A-Z]", value):
        raise ValueError(f"{label} must include one uppercase letter.")
    if not re.search(r"[0-9]", value):
        raise ValueError(f"{label} must include one number.")
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError(f"{label} must include one symbol.")
    return value


class SignupPayload(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    phoneCountryCode: str | None = None
    phoneNationalNumber: str | None = None
    phoneNumber: str | None = None
    password: str = Field(min_length=8, max_length=100)
    timezone: str = Field(default="Asia/Kolkata", min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        return normalized

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not USERNAME_PATTERN.match(normalized):
            raise ValueError("Username must be 3-30 characters and use letters, numbers, underscore, or dot. No spaces.")
        if ".." in normalized:
            raise ValueError("Username cannot contain two dots together.")
        if normalized.endswith("."):
            raise ValueError("Username cannot end with a dot.")
        return normalized

    @field_validator("phoneCountryCode")
    @classmethod
    def validate_phone_country_code(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        normalized = value.strip()
        if not re.match(r"^\+[0-9]{1,4}$", normalized):
            raise ValueError("Phone country code must look like +91.")
        return normalized

    @field_validator("phoneNationalNumber")
    @classmethod
    def validate_phone_national_number(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        digits = re.sub(r"\D", "", value)
        if len(digits) < 4 or len(digits) > 15:
            raise ValueError("Phone number must contain between 4 and 15 digits before the country code.")
        return digits

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_strong_password(value)

    @model_validator(mode="after")
    def validate_phone_fields(self) -> "SignupPayload":
        if self.phoneNumber:
            return self

        if self.phoneCountryCode and self.phoneNationalNumber:
            total_digits = len(re.sub(r"\D", "", self.phoneCountryCode + self.phoneNationalNumber))
            if total_digits < 7 or total_digits > 15:
                raise ValueError("Phone number must be valid internationally.")
            self.phoneNumber = f"{self.phoneCountryCode}{self.phoneNationalNumber}"
            return self

        raise ValueError("Phone number is required.")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class LoginPayload(BaseModel):
    identifier: str = Field(min_length=3, max_length=180)
    password: str = Field(min_length=1, max_length=100)


class PasswordResetRequestPayload(BaseModel):
    identifier: str = Field(min_length=3, max_length=180)


class PasswordResetConfirmPayload(BaseModel):
    identifier: str = Field(min_length=3, max_length=180)
    otp: str = Field(min_length=6, max_length=6)
    newPassword: str = Field(min_length=8, max_length=100)

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str) -> str:
        if not re.match(r"^[0-9]{6}$", value):
            raise ValueError("OTP must be 6 digits.")
        return value

    @field_validator("newPassword")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_strong_password(value, "New password")
