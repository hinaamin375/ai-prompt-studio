from pydantic import BaseModel, Field

from app.schemas.analysis import PromptAnalysis


class PromptComparisonRequest(BaseModel):
    left_prompt_id: int = Field(gt=0)
    right_prompt_id: int = Field(gt=0)

    left_variables: dict[str, str] = Field(default_factory=dict)
    right_variables: dict[str, str] = Field(default_factory=dict)


class PromptComparisonSummary(BaseModel):
    character_difference: int
    word_difference: int
    line_difference: int
    token_difference: int
    variable_difference: int


class PromptComparisonResponse(BaseModel):
    left: PromptAnalysis
    right: PromptAnalysis
    summary: PromptComparisonSummary