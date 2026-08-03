import { apiClient } from "../../../api/client";

import type {
  PromptComparisonRequest,
  PromptComparisonResponse,
} from "../types/comparison";

export async function comparePrompts(
  request: PromptComparisonRequest,
): Promise<PromptComparisonResponse> {
  const { data } = await apiClient.post<PromptComparisonResponse>(
    "/comparisons",
    request,
  );

  return data;
}