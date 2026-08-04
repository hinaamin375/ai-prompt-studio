import { apiClient } from "./client";
import type {
  Prompt,
  PromptCreate,
  PromptUpdate,
} from "../types/prompt";

export async function listPrompts(): Promise<Prompt[]> {
  const response = await apiClient.get<Prompt[]>(
    "/prompts",
  );

  return response.data;
}

export async function getPrompt(
  promptId: number,
): Promise<Prompt> {
  const response = await apiClient.get<Prompt>(
    `/prompts/${promptId}`,
  );

  return response.data;
}

export async function createPrompt(
  data: PromptCreate,
): Promise<Prompt> {
  const response = await apiClient.post<Prompt>(
    "/prompts",
    data,
  );

  return response.data;
}

export async function updatePrompt(
  promptId: number,
  data: PromptUpdate,
): Promise<Prompt> {
  const response = await apiClient.patch<Prompt>(
    `/prompts/${promptId}`,
    data,
  );

  return response.data;
}

export async function deletePrompt(
  promptId: number,
): Promise<void> {
  await apiClient.delete(
    `/prompts/${promptId}`,
  );
}
export async function setPromptFavorite(
  promptId: number,
  favorite: boolean,
): Promise<Prompt> {
  return updatePrompt(
    promptId,
    {
      favorite,
    },
  );
}