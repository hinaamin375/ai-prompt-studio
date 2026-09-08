from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.provider_connection import ProviderConnection


class ProviderConnectionRepository:
    def list_all(
        self,
        db: Session,
        workspace_id: int,
    ) -> list[ProviderConnection]:
        statement = (
            select(ProviderConnection)
            .where(ProviderConnection.workspace_id == workspace_id)
            .order_by(ProviderConnection.provider.asc())
        )
        return list(db.scalars(statement).all())

    def get_by_provider(
        self,
        db: Session,
        workspace_id: int,
        provider: str,
    ) -> ProviderConnection | None:
        statement = select(ProviderConnection).where(
            ProviderConnection.workspace_id == workspace_id,
            ProviderConnection.provider == provider,
        )
        return db.scalar(statement)

    def list_by_provider(
        self,
        db: Session,
        provider: str,
    ) -> list[ProviderConnection]:
        statement = select(ProviderConnection).where(
            ProviderConnection.provider == provider,
            ProviderConnection.workspace_id.is_not(None),
        )
        return list(db.scalars(statement).all())

    def claim_unscoped(
        self,
        db: Session,
        workspace_id: int,
    ) -> int:
        result = db.execute(
            update(ProviderConnection)
            .where(ProviderConnection.workspace_id.is_(None))
            .values(workspace_id=workspace_id)
        )
        return int(result.rowcount or 0)

    def save(
        self,
        db: Session,
        connection: ProviderConnection,
    ) -> ProviderConnection:
        db.add(connection)
        db.commit()
        db.refresh(connection)
        return connection

    def delete(
        self,
        db: Session,
        connection: ProviderConnection,
    ) -> None:
        db.delete(connection)
        db.commit()


provider_connection_repository = ProviderConnectionRepository()
