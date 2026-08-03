import type { PromptAnalysis } from "../../analysis/types/analysis";

export interface PromptComparisonRequest {
  left_prompt_id: number;
  right_prompt_id: number;

  left_variables: Record<string, string>;
  right_variables: Record<string, string>;
}

export interface PromptComparisonResponse {
  left: PromptAnalysis;
  right: PromptAnalysis;
}