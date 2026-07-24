from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.settings import get_settings
from app.db.pool import pool
from app.api.routes.auth import router as auth_router
from app.api.routes.people import router as people_router
from app.api.routes.schedules import router as schedules_router

settings = get_settings()
app = FastAPI(title="Schedular API", version="1.0.0")


@app.on_event("startup")
def on_startup() -> None:
    pool.open()


@app.on_event("shutdown")
def on_shutdown() -> None:
    pool.close()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health() -> dict:
    from datetime import datetime, timezone

    return {
        "success": True,
        "data": {
            "service": "schedular-api-python",
            "status": "ok",
            "time": datetime.now(timezone.utc).isoformat(),
        },
    }


app.include_router(auth_router, prefix="/api/v1")
app.include_router(people_router, prefix="/api/v1")
app.include_router(schedules_router, prefix="/api/v1")
