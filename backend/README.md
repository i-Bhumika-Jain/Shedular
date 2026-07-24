# Python Backend (FastAPI)

## Setup

1. Create environment variables file:

```bash
copy .env.example .env
```

2. Install dependencies:

```bash
uv sync
```

3. Run migrations:

```bash
uv run python -m app.db.migrate
```

4. Run API server:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

Health endpoint:

`http://localhost:8000/api/v1/health`
