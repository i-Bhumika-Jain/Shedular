from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from fastapi import APIRouter, HTTPException, status
from psycopg.rows import dict_row
from app.core.settings import get_settings
from app.core.phone_countries import DEFAULT_PHONE_COUNTRY_CODE, PHONE_COUNTRIES
from app.db.pool import pool
from app.schemas.auth import LoginPayload, PasswordResetConfirmPayload, PasswordResetRequestPayload, SignupPayload
from app.security.auth import (
    create_access_token,
    hash_password,
    normalize_phone_number,
    verify_password,
)
from app.api.deps import CurrentUser

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
OTP_EXPIRES_MINUTES = 10
OTP_MAX_ATTEMPTS = 5


def to_public_user(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "username": row["username"],
        "email": row["email"],
        "phoneNumber": row["phone_number"],
        "timezone": row["timezone"],
        "status": row["status"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def find_user_by_identifier(cur, identifier: str) -> dict | None:
    normalized_phone = normalize_phone_number(identifier)
    phone_digits = "".join(char for char in (normalized_phone or "") if char.isdigit())
    local_phone_pattern = f"%{phone_digits}" if phone_digits and not identifier.strip().startswith("+") else None

    if local_phone_pattern:
        cur.execute(
            """
            SELECT *
            FROM users
            WHERE lower(email) = lower(%s)
               OR lower(username) = lower(%s)
               OR phone_number = %s
               OR regexp_replace(coalesce(phone_number, ''), '[^0-9]', '', 'g') LIKE %s
            ORDER BY
              CASE
                WHEN lower(email) = lower(%s) THEN 1
                WHEN lower(username) = lower(%s) THEN 2
                WHEN phone_number = %s THEN 3
                ELSE 4
              END
            LIMIT 1
            """,
            (
                identifier,
                identifier,
                normalized_phone,
                local_phone_pattern,
                identifier,
                identifier,
                normalized_phone,
            ),
        )
        return cur.fetchone()

    cur.execute(
        """
        SELECT *
        FROM users
        WHERE lower(email) = lower(%s)
           OR lower(username) = lower(%s)
           OR phone_number = %s
        ORDER BY
          CASE
            WHEN lower(email) = lower(%s) THEN 1
            WHEN lower(username) = lower(%s) THEN 2
            WHEN phone_number = %s THEN 3
            ELSE 4
          END
        LIMIT 1
        """,
        (
            identifier,
            identifier,
            normalized_phone,
            identifier,
            identifier,
            normalized_phone,
        ),
    )
    return cur.fetchone()


def otp_channel_for_user(user: dict, identifier: str) -> tuple[str, str]:
    identifier_value = identifier.strip()
    if "@" in identifier_value or not user.get("phone_number"):
        return "email", user["email"]
    return "phone", user["phone_number"]


@router.get("/phone-country-codes")
def phone_country_codes():
    return {
        "success": True,
        "message": "Phone country codes fetched successfully.",
        "data": {
            "defaultCountryCode": DEFAULT_PHONE_COUNTRY_CODE,
            "countries": PHONE_COUNTRIES,
        },
    }


@router.post("/signup")
def signup(payload: SignupPayload):
    normalized_phone = normalize_phone_number(payload.phoneNumber)
    username = payload.username.lower().strip()
    email = payload.email.lower().strip()
    password_hash = hash_password(payload.password)

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT id FROM users WHERE lower(email) = lower(%s) LIMIT 1", (email,))
            if cur.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists.")

            cur.execute("SELECT id FROM users WHERE lower(username) = lower(%s) LIMIT 1", (username,))
            if cur.fetchone():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists.")

            if normalized_phone:
                cur.execute("SELECT id FROM users WHERE phone_number = %s LIMIT 1", (normalized_phone,))
                if cur.fetchone():
                    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already exists.")

            cur.execute(
                """
                INSERT INTO users (name, username, email, phone_number, password_hash, timezone)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    payload.name.strip(),
                    username,
                    email,
                    normalized_phone,
                    password_hash,
                    payload.timezone.strip(),
                ),
            )
            user = cur.fetchone()

            cur.execute("INSERT INTO user_profiles (user_id) VALUES (%s)", (user["id"],))
            cur.execute(
                """
                INSERT INTO schedule_people (owner_user_id, display_name, relationship, timezone)
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (user["id"], payload.name.strip(), "self", payload.timezone.strip()),
            )
            person = cur.fetchone()
            cur.execute(
                "INSERT INTO person_members (person_id, user_id, role) VALUES (%s, %s, 'owner')",
                (person["id"], user["id"]),
            )
            cur.execute(
                """
                INSERT INTO schedules (person_id, created_by, name, schedule_type, timezone)
                VALUES (%s, %s, %s, 'weekly_template', %s)
                RETURNING *
                """,
                (person["id"], user["id"], "Weekly Schedule", payload.timezone.strip()),
            )
            schedule = cur.fetchone()
            conn.commit()

    token = create_access_token(subject=str(user["id"]), email=user["email"], username=user["username"])
    return {
        "success": True,
        "message": "Account created successfully.",
        "data": {
            "user": to_public_user(user),
            "token": token,
            "defaultPerson": {
                "id": person["id"],
                "ownerUserId": person["owner_user_id"],
                "displayName": person["display_name"],
                "relationship": person["relationship"],
                "timezone": person["timezone"],
                "role": "owner",
                "createdAt": person["created_at"],
                "updatedAt": person["updated_at"],
            },
            "defaultSchedule": {
                "id": schedule["id"],
                "personId": schedule["person_id"],
                "createdBy": schedule["created_by"],
                "name": schedule["name"],
                "scheduleType": schedule["schedule_type"],
                "timezone": schedule["timezone"],
                "startDate": schedule["start_date"],
                "endDate": schedule["end_date"],
                "isActive": schedule["is_active"],
                "createdAt": schedule["created_at"],
                "updatedAt": schedule["updated_at"],
            },
        },
    }


@router.post("/login")
def login(payload: LoginPayload):
    identifier = payload.identifier.strip()

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            user = find_user_by_identifier(cur, identifier)

    if not user or user["status"] != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    token = create_access_token(subject=str(user["id"]), email=user["email"], username=user["username"])
    return {
        "success": True,
        "message": "Logged in successfully.",
        "data": {
            "user": to_public_user(user),
            "token": token,
        },
    }


@router.post("/password-reset/request")
def request_password_reset(payload: PasswordResetRequestPayload):
    identifier = payload.identifier.strip()
    dev_otp = None

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            user = find_user_by_identifier(cur, identifier)

            if user and user["status"] == "active":
                otp = f"{secrets.randbelow(1_000_000):06d}"
                channel, destination = otp_channel_for_user(user, identifier)
                expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRES_MINUTES)
                cur.execute(
                    """
                    UPDATE password_reset_otps
                    SET consumed_at = now()
                    WHERE user_id = %s AND consumed_at IS NULL
                    """,
                    (user["id"],),
                )
                cur.execute(
                    """
                    INSERT INTO password_reset_otps (user_id, channel, destination, code_hash, expires_at)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (user["id"], channel, destination, hash_otp(otp), expires_at),
                )
                if settings.app_env != "production":
                    dev_otp = otp

            conn.commit()

    return {
        "success": True,
        "message": "If the account exists, an OTP has been sent.",
        "data": {
            "expiresInMinutes": OTP_EXPIRES_MINUTES,
            "devOtp": dev_otp,
        },
    }


@router.post("/password-reset/confirm")
def confirm_password_reset(payload: PasswordResetConfirmPayload):
    identifier = payload.identifier.strip()

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            user = find_user_by_identifier(cur, identifier)
            if not user or user["status"] != "active":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")

            cur.execute(
                """
                SELECT *
                FROM password_reset_otps
                WHERE user_id = %s
                  AND consumed_at IS NULL
                  AND expires_at > now()
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (user["id"],),
            )
            reset_row = cur.fetchone()

            if not reset_row or reset_row["attempts"] >= OTP_MAX_ATTEMPTS:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")

            if reset_row["code_hash"] != hash_otp(payload.otp):
                cur.execute(
                    "UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = %s",
                    (reset_row["id"],),
                )
                conn.commit()
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")

            cur.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (hash_password(payload.newPassword), user["id"]),
            )
            cur.execute(
                "UPDATE password_reset_otps SET consumed_at = now() WHERE id = %s",
                (reset_row["id"],),
            )
            conn.commit()

    return {
        "success": True,
        "message": "Password reset successfully. You can sign in now.",
        "data": {"reset": True},
    }


@router.get("/me")
def me(current_user: dict = CurrentUser):
    return {
        "success": True,
        "message": "Current user fetched successfully.",
        "data": {"user": to_public_user(current_user)},
    }
