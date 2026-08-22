import {
  apiClient,
} from "../../../api/client";

import type {
  PromptRunHistory,
} from "../types/runHistory";


export async function listPromptRuns(
  promptId: number,
): Promise<PromptRunHistory[]> {
  const response = await apiClient.get<
    PromptRunHistory[]
  >(
    `/prompts/${promptId}/runs`,
  );

  return response.data;
}


export async function getPromptRun(
  promptId: number,
  runId: number,
): Promise<PromptRunHistory> {
  const response = await apiClient.get<
    PromptRunHistory
  >(
    `/prompts/${promptId}/runs/${runId}`,
  );

  return response.data;
}