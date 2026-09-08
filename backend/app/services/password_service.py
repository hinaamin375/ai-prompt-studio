import base64
import hashlib
import hmac
import secrets


class PasswordService:
    _N = 2**14
    _R = 8
    _P = 1
    _DKLEN = 64

    def hash(self, password: str) -> str:
        salt = secrets.token_bytes(16)
        digest = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=self._N,
            r=self._R,
            p=self._P,
            dklen=self._DKLEN,
        )
        return "scrypt${}${}${}${}${}".format(
            self._N,
            self._R,
            self._P,
            base64.urlsafe_b64encode(salt).decode("ascii"),
            base64.urlsafe_b64encode(digest).decode("ascii"),
        )

    def verify(self, password: str, encoded: str) -> bool:
        try:
            algorithm, n, r, p, salt_b64, digest_b64 = encoded.split("$", 5)
            if algorithm != "scrypt":
                return False
            salt = base64.urlsafe_b64decode(salt_b64.encode("ascii"))
            expected = base64.urlsafe_b64decode(digest_b64.encode("ascii"))
            actual = hashlib.scrypt(
                password.encode("utf-8"),
                salt=salt,
                n=int(n),
                r=int(r),
                p=int(p),
                dklen=len(expected),
            )
        except (ValueError, TypeError):
            return False

        return hmac.compare_digest(actual, expected)


password_service = PasswordService()
