from fastapi import Depends, Header, HTTPException, status
from psycopg.rows import dict_row
from app.db.pool import pool
from app.security.auth import decode_access_token


def get_current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_access_token(token)
    except Exception as error:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.") from error

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM users WHERE id = %s LIMIT 1", (user_id,))
            user = cur.fetchone()

    if not user or user["status"] != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user.")

    return user


CurrentUser = Depends(get_current_user)
