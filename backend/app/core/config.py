from functools import lru_cache

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    app_name: str = "AI Prompt Studio API"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    api_v1_prefix: str = "/api/v1"

    frontend_url: str = "http://localhost:5173"

    database_url: str = "sqlite:///./prompt_studio.db"

    # -------------------------------------------------
    # Qwen / Alibaba Model Studio
    # -------------------------------------------------

    qwen_api_key: str | None = None

    qwen_base_url: str = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

    qwen_default_model: str = "qwen3.6-plus"

    # -------------------------------------------------
    # Gemini / Google AI
    # -------------------------------------------------

    gemini_api_key: str | None = None

    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"

    gemini_default_model: str = "gemini-3.1-flash-lite"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
