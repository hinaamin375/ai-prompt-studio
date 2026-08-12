import { apiClient } from "./client";

import type { Prompt } from "../types/prompt";
import type { PromptVersion } from "../types/promptVersion";


export async function listPromptVersions(
  promptId: number,
): Promise<PromptVersion[]> {
  const response = await apiClient.get<
    PromptVersion[]
  >(
    `/prompts/${promptId}/versions`,
  );

  return response.data;
}


export async function getPromptVersion(
  promptId: number,
  version: number,
): Promise<PromptVersion> {
  const response =
    await apiClient.get<PromptVersion>(
      `/prompts/${promptId}/versions/${version}`,
    );

  return response.data;
}


export async function restorePromptVersion(
  promptId: number,
  version: number,
): Promise<Prompt> {
  const response =
    await apiClient.post<Prompt>(
      `/prompts/${promptId}/versions/${version}/restore`,
    );

  return response.data;
}