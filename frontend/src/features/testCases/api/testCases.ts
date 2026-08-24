import {
  apiClient,
} from "../../../api/client";

import type {
  PromptTestCase,
  PromptTestCaseCreate,
  PromptTestCaseRunRequest,
  PromptTestCaseRunResponse,
  PromptTestCaseUpdate,
} from "../types/testCase";


export async function listPromptTestCases(
  promptId: number,
): Promise<PromptTestCase[]> {
  const response = await apiClient.get<
    PromptTestCase[]
  >(
    `/prompts/${promptId}/test-cases`,
  );

  return response.data;
}


export async function createPromptTestCase(
  promptId: number,
  data: PromptTestCaseCreate,
): Promise<PromptTestCase> {
  const response = await apiClient.post<
    PromptTestCase
  >(
    `/prompts/${promptId}/test-cases`,
    data,
  );

  return response.data;
}


export async function updatePromptTestCase(
  promptId: number,
  testCaseId: number,
  data: PromptTestCaseUpdate,
): Promise<PromptTestCase> {
  const response = await apiClient.patch<
    PromptTestCase
  >(
    `/prompts/${promptId}/test-cases/${testCaseId}`,
    data,
  );

  return response.data;
}


export async function deletePromptTestCase(
  promptId: number,
  testCaseId: number,
): Promise<void> {
  await apiClient.delete(
    `/prompts/${promptId}/test-cases/${testCaseId}`,
  );
}


export async function runPromptTestCase(
  promptId: number,
  testCaseId: number,
  data: PromptTestCaseRunRequest,
): Promise<PromptTestCaseRunResponse> {
  const response = await apiClient.post<
    PromptTestCaseRunResponse
  >(
    `/prompts/${promptId}/test-cases/${testCaseId}/run`,
    data,
  );

  return response.data;
}