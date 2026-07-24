from psycopg_pool import ConnectionPool
from app.core.settings import get_settings

settings = get_settings()

pool = ConnectionPool(
    conninfo=settings.database_url,
    max_size=10,
    min_size=1,
    kwargs={"autocommit": False},
    open=False,
)
