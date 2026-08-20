from .collections import (
    router as collections_router,
)
from .comparisons import (
    router as comparisons_router,
)
from .health import (
    router as health_router,
)
from .prompts import (
    router as prompts_router,
)
from .tags import (
    router as tags_router,
)
from app.api.routes.providers import (
    router as providers_router,
)

__all__ = [
    "collections_router",
    "comparisons_router",
    "health_router",
    "prompts_router",
    "tags_router",
    "providers_router",
]
