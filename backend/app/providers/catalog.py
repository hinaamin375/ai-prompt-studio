from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class ProviderDefinition:
    provider_id: str
    display_name: str
    base_url: str
    default_model: str
    models: tuple[str, ...]


PROVIDER_CATALOG: dict[str, ProviderDefinition] = {
    "gemini": ProviderDefinition(
        provider_id="gemini",
        display_name="Google Gemini",
        base_url="https://generativelanguage.googleapis.com/v1beta",
        default_model="gemini-3.1-flash-lite",
        models=(
            "gemini-3.1-flash-lite",
            "gemini-3-pro-preview",
        ),
    ),
    "qwen": ProviderDefinition(
        provider_id="qwen",
        display_name="Qwen",
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        default_model="qwen3.6-plus",
        models=(
            "qwen3.6-plus",
        ),
    ),
    "openai": ProviderDefinition(
        provider_id="openai",
        display_name="OpenAI",
        base_url="https://api.openai.com/v1",
        default_model="gpt-5.6-terra",
        models=(
            "gpt-5.6",
            "gpt-5.6-terra",
            "gpt-5.6-luna",
        ),
    ),
    "anthropic": ProviderDefinition(
        provider_id="anthropic",
        display_name="Anthropic",
        base_url="https://api.anthropic.com/v1",
        default_model="claude-sonnet-5",
        models=(
            "claude-sonnet-5",
            "claude-opus-5",
            "claude-fable-5",
        ),
    ),
}
