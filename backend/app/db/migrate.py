from pathlib import Path
from psycopg import connect
from app.core.settings import get_settings


def run_migrations() -> None:
    settings = get_settings()
    migrations_dir = Path(__file__).resolve().parents[2] / "migrations"
    files = sorted([path for path in migrations_dir.glob("*.sql")])

    with connect(settings.database_url, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                  filename TEXT PRIMARY KEY,
                  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
                """
            )
            cur.execute("SELECT filename FROM schema_migrations")
            applied = {row[0] for row in cur.fetchall()}

            for file_path in files:
                if file_path.name in applied:
                    continue

                sql = file_path.read_text(encoding="utf-8")
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (%s)",
                    (file_path.name,),
                )
                print(f"Applied migration: {file_path.name}")

        conn.commit()

    print("Database migrations complete.")


if __name__ == "__main__":
    run_migrations()
