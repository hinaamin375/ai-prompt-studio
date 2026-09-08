from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings


class CredentialEncryptionError(RuntimeError):
    pass


class CredentialCipher:
    def _fernet(self) -> Fernet:
        secret = settings.credential_encryption_key

        if secret is None:
            raise CredentialEncryptionError(
                "CREDENTIAL_ENCRYPTION_KEY is not configured."
            )

        raw_key = secret.get_secret_value().strip()

        if not raw_key:
            raise CredentialEncryptionError(
                "CREDENTIAL_ENCRYPTION_KEY is not configured."
            )

        try:
            return Fernet(raw_key.encode("utf-8"))
        except (TypeError, ValueError) as exc:
            raise CredentialEncryptionError(
                "CREDENTIAL_ENCRYPTION_KEY is not a valid Fernet key."
            ) from exc

    def encrypt(self, value: str) -> str:
        return self._fernet().encrypt(
            value.encode("utf-8"),
        ).decode("utf-8")

    def decrypt(self, value: str) -> str:
        try:
            return self._fernet().decrypt(
                value.encode("utf-8"),
            ).decode("utf-8")
        except InvalidToken as exc:
            raise CredentialEncryptionError(
                "Stored provider credential could not be decrypted."
            ) from exc


credential_cipher = CredentialCipher()
