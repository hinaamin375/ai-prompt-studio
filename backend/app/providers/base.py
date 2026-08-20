from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class ProviderMessage:
    role: str
    content: str


@dataclass(frozen=True, slots=True)
class ProviderUsage:
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None


@dataclass(frozen=True, slots=True)
class ProviderResult:
    provider: str
    model: str
    output_text: str
    usage: ProviderUsage


class ModelProvider(ABC):
    provider_id: str
    display_name: str

    @property
    @abstractmethod
    def default_model(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def run(
        self,
        *,
        messages: list[ProviderMessage],
        model: str | None = None,
    ) -> ProviderResult:
        raise NotImplementedError
