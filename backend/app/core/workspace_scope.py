from sqlalchemy.orm import Session

from app.core.exceptions import ApplicationError


def current_workspace_id(db: Session) -> int:
    workspace_id = db.info.get("workspace_id")

    if not isinstance(workspace_id, int):
        raise ApplicationError(
            "Authentication required.",
            code="authentication_required",
            status_code=401,
        )

    return workspace_id
