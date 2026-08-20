import {
  apiClient,
} from "../../../api/client";

import type {
  PromptRunRequest,
  PromptRunResponse,
} from "../types/playground";


export async function runPrompt(
  promptId: number,
  data: PromptRunRequest,
): Promise<PromptRunResponse> {
  const response =
    await apiClient.post<PromptRunResponse>(
      `/prompts/${promptId}/run`,
      data,
    );

  return response.data;
}