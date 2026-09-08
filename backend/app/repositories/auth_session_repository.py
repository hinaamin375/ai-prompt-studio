from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.models.auth_session import AuthSession


class AuthSessionRepository:
    def create(self, db: Session, session: AuthSession) -> AuthSession:
        db.add(session)
        db.flush()
        return session

    def get_valid_by_hash(
        self,
        db: Session,
        token_hash: str,
    ) -> AuthSession | None:
        statement = select(AuthSession).where(
            AuthSession.token_hash == token_hash,
            AuthSession.expires_at > func.now(),
        )
        return db.scalar(statement)

    def delete(self, db: Session, session: AuthSession) -> None:
        db.delete(session)
        db.commit()

    def delete_expired(self, db: Session) -> None:
        db.execute(
            delete(AuthSession).where(
                AuthSession.expires_at <= func.now()
            )
        )


auth_session_repository = AuthSessionRepository()
