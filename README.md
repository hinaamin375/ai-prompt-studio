# AI Prompt Studio

AI Prompt Studio is a developer-focused platform for building, testing,
versioning, comparing, and governing AI prompts.

## Current status

Foundation milestone in progress.

## Technology

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- Axios

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- SQLite

## Local development

### Backend

```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload