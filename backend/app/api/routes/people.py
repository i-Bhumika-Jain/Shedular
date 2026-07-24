from fastapi import APIRouter
from psycopg.rows import dict_row
from app.api.deps import CurrentUser
from app.db.pool import pool

router = APIRouter(prefix="/people", tags=["people"])


@router.get("")
def list_people(current_user: dict = CurrentUser):
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT p.*, pm.role
                FROM person_members pm
                JOIN schedule_people p ON p.id = pm.person_id
                WHERE pm.user_id = %s AND p.deleted_at IS NULL
                ORDER BY p.created_at ASC
                """,
                (current_user["id"],),
            )
            rows = cur.fetchall()

    people = [
        {
            "id": row["id"],
            "ownerUserId": row["owner_user_id"],
            "displayName": row["display_name"],
            "relationship": row["relationship"],
            "timezone": row["timezone"],
            "role": row["role"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
        for row in rows
    ]

    return {"success": True, "message": "People fetched successfully.", "data": {"people": people}}
