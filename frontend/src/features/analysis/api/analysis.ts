import { apiClient } from "../../../api/client";

import type {
  AnalyzePromptRequest,
  PromptAnalysis,
} from "../types/analysis";

export async function analyzePrompt(
  promptId: number,
  data: AnalyzePromptRequest,
): Promise<PromptAnalysis> {
  const response = await apiClient.post<PromptAnalysis>(
    `/prompts/${promptId}/analyze`,
    data,
  );

  return response.data;
}