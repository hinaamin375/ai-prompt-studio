from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "ai-prompt-studio-api",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }