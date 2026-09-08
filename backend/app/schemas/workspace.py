from pydantic import BaseModel, Field

from app.schemas.auth import WorkspaceResponse


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class WorkspaceListResponse(BaseModel):
    workspaces: list[WorkspaceResponse]
