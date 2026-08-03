from .comparisons import router as comparisons_router
from .health import router as health_router
from .prompts import router as prompts_router

__all__ = [
    "comparisons_router",
    "health_router",
    "prompts_router",
]