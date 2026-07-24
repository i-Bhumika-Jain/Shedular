from fastapi import APIRouter, HTTPException, Query, status
from psycopg.types.json import Jsonb
from psycopg.rows import dict_row
from app.api.deps import CurrentUser
from app.db.pool import pool
from app.schemas.schedules import (
    CompletionPayload,
    CreateScheduleItemPayload,
    CreateSchedulePayload,
    UpdateSchedulePayload,
)

router = APIRouter(tags=["schedules"])


def get_person_role(user_id: str, person_id: str) -> str | None:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT pm.role
                FROM person_members pm
                JOIN schedule_people p ON p.id = pm.person_id
                WHERE pm.user_id = %s AND pm.person_id = %s AND p.deleted_at IS NULL
                LIMIT 1
                """,
                (user_id, person_id),
            )
            row = cur.fetchone()
    return row["role"] if row else None


def get_schedule_role(user_id: str, schedule_id: str) -> dict | None:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT s.*, pm.role
                FROM schedules s
                JOIN person_members pm ON pm.person_id = s.person_id
                JOIN schedule_people p ON p.id = s.person_id
                WHERE s.id = %s
                  AND pm.user_id = %s
                  AND s.deleted_at IS NULL
                  AND p.deleted_at IS NULL
                LIMIT 1
                """,
                (schedule_id, user_id),
            )
            return cur.fetchone()


def serialize_schedule(row: dict) -> dict:
    return {
        "id": row["id"],
        "personId": row["person_id"],
        "createdBy": row["created_by"],
        "name": row["name"],
        "scheduleType": row["schedule_type"],
        "timezone": row["timezone"],
        "startDate": row["start_date"],
        "endDate": row["end_date"],
        "isActive": row["is_active"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


@router.get("/people/{person_id}/schedules")
def list_schedules(person_id: str, current_user: dict = CurrentUser):
    role = get_person_role(str(current_user["id"]), person_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found.")

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT *
                FROM schedules
                WHERE person_id = %s AND deleted_at IS NULL
                ORDER BY created_at ASC
                """,
                (person_id,),
            )
            rows = cur.fetchall()

    schedules = [serialize_schedule(row) for row in rows]

    return {"success": True, "message": "Schedules fetched successfully.", "data": {"schedules": schedules}}


@router.post("/people/{person_id}/schedules")
def create_schedule(person_id: str, payload: CreateSchedulePayload, current_user: dict = CurrentUser):
    role = get_person_role(str(current_user["id"]), person_id)
    if role not in {"owner", "editor"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO schedules (person_id, created_by, name, schedule_type, timezone, start_date, end_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    person_id,
                    current_user["id"],
                    payload.name,
                    payload.scheduleType,
                    payload.timezone,
                    payload.startDate,
                    payload.endDate,
                ),
            )
            row = cur.fetchone()
            conn.commit()

    schedule = serialize_schedule(row)
    return {"success": True, "message": "Schedule created successfully.", "data": {"schedule": schedule}}


@router.patch("/schedules/{schedule_id}")
def update_schedule(schedule_id: str, payload: UpdateSchedulePayload, current_user: dict = CurrentUser):
    access = get_schedule_role(str(current_user["id"]), schedule_id)
    if not access:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found.")
    if access["role"] not in {"owner", "editor"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    values = []
    assignments = []
    data = payload.model_dump(exclude_unset=True)

    if "name" in data:
        assignments.append("name = %s")
        values.append(data["name"])
    if "timezone" in data:
        assignments.append("timezone = %s")
        values.append(data["timezone"])

    if not assignments:
        return {
            "success": True,
            "message": "Schedule unchanged.",
            "data": {"schedule": serialize_schedule(access)},
        }

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                f"""
                UPDATE schedules
                SET {", ".join(assignments)}, updated_at = now()
                WHERE id = %s AND deleted_at IS NULL
                RETURNING *
                """,
                [*values, schedule_id],
            )
            row = cur.fetchone()
            conn.commit()

    return {
        "success": True,
        "message": "Schedule updated successfully.",
        "data": {"schedule": serialize_schedule(row)},
    }


@router.get("/schedules/{schedule_id}/items")
def list_schedule_items(
    schedule_id: str,
    weekday: int | None = Query(default=None, ge=0, le=6),
    date: str | None = Query(default=None),
    completionDate: str | None = Query(default=None),
    current_user: dict = CurrentUser,
):
    access = get_schedule_role(str(current_user["id"]), schedule_id)
    if not access:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found.")

    conditions = ["si.schedule_id = %s", "si.deleted_at IS NULL"]
    values: list = [schedule_id]

    if weekday is not None:
        conditions.append("si.weekday = %s")
        values.append(weekday)

    if date is not None:
        conditions.append("si.scheduled_date = %s")
        values.append(date)

    effective_completion_date = completionDate or date

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            if effective_completion_date:
                sql = f"""
                SELECT
                  si.*,
                  tc.status AS completion_status,
                  tc.completed_at,
                  tc.note AS completion_note
                FROM schedule_items si
                LEFT JOIN task_completions tc
                  ON tc.schedule_item_id = si.id
                  AND tc.completion_date = %s
                WHERE {' AND '.join(conditions)}
                ORDER BY si.start_time ASC, si.created_at ASC
                """
                cur.execute(sql, [effective_completion_date, *values])
            else:
                sql = f"""
                SELECT
                  si.*,
                  NULL::text AS completion_status,
                  NULL::timestamptz AS completed_at,
                  NULL::text AS completion_note
                FROM schedule_items si
                WHERE {' AND '.join(conditions)}
                ORDER BY si.start_time ASC, si.created_at ASC
                """
                cur.execute(sql, values)
            rows = cur.fetchall()

    items = [
        {
            "id": row["id"],
            "scheduleId": row["schedule_id"],
            "createdBy": row["created_by"],
            "title": row["title"],
            "description": row["description"],
            "category": row["category"],
            "priority": row["priority"],
            "weekday": row["weekday"],
            "scheduledDate": row["scheduled_date"],
            "startTime": str(row["start_time"])[:5],
            "endTime": str(row["end_time"])[:5] if row["end_time"] else None,
            "timezone": row["timezone"],
            "recurrenceRule": row["recurrence_rule"],
            "source": row["source"],
            "metadata": row["metadata"],
            "completionStatus": row["completion_status"],
            "completedAt": row["completed_at"],
            "completionNote": row["completion_note"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
        for row in rows
    ]

    return {"success": True, "message": "Schedule items fetched successfully.", "data": {"items": items}}


@router.post("/schedules/{schedule_id}/items")
def create_schedule_item(schedule_id: str, payload: CreateScheduleItemPayload, current_user: dict = CurrentUser):
    access = get_schedule_role(str(current_user["id"]), schedule_id)
    if not access:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found.")
    if access["role"] not in {"owner", "editor"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    if (payload.weekday is None and payload.scheduledDate is None) or (
        payload.weekday is not None and payload.scheduledDate is not None
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide exactly one of weekday or scheduledDate.",
        )

    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                INSERT INTO schedule_items (
                  schedule_id, created_by, title, description, category, priority,
                  weekday, scheduled_date, start_time, end_time, timezone,
                  recurrence_rule, source, metadata
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s::jsonb)
                RETURNING *
                """,
                (
                    schedule_id,
                    current_user["id"],
                    payload.title,
                    payload.description,
                    payload.category,
                    payload.priority,
                    payload.weekday,
                    payload.scheduledDate,
                    payload.startTime,
                    payload.endTime,
                    payload.timezone,
                    Jsonb(payload.recurrenceRule),
                    payload.source,
                    Jsonb(payload.metadata),
                ),
            )
            row = cur.fetchone()
            conn.commit()

    item = {
        "id": row["id"],
        "scheduleId": row["schedule_id"],
        "createdBy": row["created_by"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "priority": row["priority"],
        "weekday": row["weekday"],
        "scheduledDate": row["scheduled_date"],
        "startTime": str(row["start_time"])[:5],
        "endTime": str(row["end_time"])[:5] if row["end_time"] else None,
        "timezone": row["timezone"],
        "recurrenceRule": row["recurrence_rule"],
        "source": row["source"],
        "metadata": row["metadata"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }
    return {"success": True, "message": "Schedule item created successfully.", "data": {"item": item}}


@router.post("/schedule-items/{item_id}/completions")
def complete_schedule_item(item_id: str, payload: CompletionPayload, current_user: dict = CurrentUser):
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT si.id, pm.role
                FROM schedule_items si
                JOIN schedules s ON s.id = si.schedule_id
                JOIN person_members pm ON pm.person_id = s.person_id
                WHERE si.id = %s
                  AND pm.user_id = %s
                  AND si.deleted_at IS NULL
                  AND s.deleted_at IS NULL
                LIMIT 1
                """,
                (item_id, current_user["id"]),
            )
            access = cur.fetchone()
            if not access:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule item not found.")
            if access["role"] not in {"owner", "editor"}:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

            cur.execute(
                """
                INSERT INTO task_completions (schedule_item_id, user_id, completion_date, status, note)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (schedule_item_id, completion_date)
                DO UPDATE SET user_id = excluded.user_id, status = excluded.status, note = excluded.note, completed_at = now()
                RETURNING *
                """,
                (item_id, current_user["id"], payload.completionDate, payload.status, payload.note),
            )
            row = cur.fetchone()
            conn.commit()

    completion = {
        "id": row["id"],
        "scheduleItemId": row["schedule_item_id"],
        "userId": row["user_id"],
        "completionDate": row["completion_date"],
        "status": row["status"],
        "note": row["note"],
        "completedAt": row["completed_at"],
    }
    return {"success": True, "message": "Schedule item completion saved successfully.", "data": {"completion": completion}}
