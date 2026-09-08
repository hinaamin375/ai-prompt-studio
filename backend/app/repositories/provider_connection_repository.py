from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.provider_connection import ProviderConnection


class ProviderConnectionRepository:
    def list_all(
        self,
        db: Session,
    ) -> list[ProviderConnection]:
        statement = select(ProviderConnection).order_by(
            ProviderConnection.provider.asc(),
        )

        return list(db.scalars(statement).all())

    def get_by_provider(
        self,
        db: Session,
        provider: str,
    ) -> ProviderConnection | None:
        statement = select(ProviderConnection).where(
            ProviderConnection.provider == provider,
        )

        return db.scalar(statement)

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
