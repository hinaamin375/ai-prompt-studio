class ApplicationError(Exception):
    def __init__(
        self,
        message: str,
        *,
        code: str = "application_error",
        status_code: int = 400,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code

        super().__init__(message)


class UnsupportedProviderError(ApplicationError):
    def __init__(
        self,
        provider: str,
    ) -> None:
        super().__init__(
            (f"The provider '{provider}' is not supported."),
            code="unsupported_provider",
            status_code=400,
        )


class ProviderNotConfiguredError(ApplicationError):
    def __init__(
        self,
        provider: str,
    ) -> None:
        super().__init__(
            (f"The provider '{provider}' is not configured."),
            code="provider_not_configured",
            status_code=503,
        )


class PromptVariablesMissingError(ApplicationError):
    def __init__(
        self,
        variables: list[str],
    ) -> None:
        joined = ", ".join(sorted(variables))

        super().__init__(
            (f"Values are required for these prompt variables: {joined}."),
            code="prompt_variables_missing",
            status_code=422,
        )


class PromptRunError(ApplicationError):
    def __init__(self) -> None:
        super().__init__(
            "The prompt could not be executed.",
            code="prompt_run_failed",
            status_code=502,
        )
