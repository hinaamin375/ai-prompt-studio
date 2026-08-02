import { useMutation } from "@tanstack/react-query";

import { analyzePrompt } from "../api/analysis";
import type {
  AnalyzePromptRequest,
  PromptAnalysis,
} from "../types/analysis";

interface AnalyzePromptVariables {
  promptId: number;
  data: AnalyzePromptRequest;
}

export function usePromptAnalysis() {
  return useMutation<
    PromptAnalysis,
    Error,
    AnalyzePromptVariables
  >({
    mutationFn: ({ promptId, data }) =>
      analyzePrompt(promptId, data),
  });
}