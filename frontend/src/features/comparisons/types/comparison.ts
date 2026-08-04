import type {
  PromptAnalysis,
} from "../../analysis/types/analysis";

export interface PromptComparisonRequest {
  left_prompt_id: number;
  right_prompt_id: number;

  left_variables: Record<string, string>;
  right_variables: Record<string, string>;
}

export interface PromptComparisonSummary {
  character_difference: number;
  word_difference: number;
  line_difference: number;
  token_difference: number;
  variable_difference: number;

  similarity: number;
}

export interface PromptComparisonResponse {
  left: PromptAnalysis;
  right: PromptAnalysis;

  summary: PromptComparisonSummary;
}