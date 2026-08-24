import type {
  PromptRunResponse,
} from "../../playground/types/playground";


export interface PromptTestCase {
  id: number;
  prompt_id: number;

  name: string;
  description: string | null;

  variables: Record<string, unknown>;

  expected_contains: string[];

  created_at: string;
  updated_at: string;
}


export interface PromptTestCaseCreate {
  name: string;
  description?: string | null;

  variables: Record<string, unknown>;

  expected_contains: string[];
}


export interface PromptTestCaseUpdate {
  name?: string;
  description?: string | null;

  variables?: Record<string, unknown>;

  expected_contains?: string[];
}


export interface PromptTestCaseRunRequest {
  provider: string;
  model?: string | null;

  temperature?: number | null;
  max_output_tokens?: number | null;
}


export interface PromptTestAssertionResult {
  expected: string;
  passed: boolean;
}


export interface PromptTestCaseRunResponse {
  test_case_id: number;
  test_case_name: string;

  passed: boolean;
  passed_count: number;
  failed_count: number;

  assertions: PromptTestAssertionResult[];

  run: PromptRunResponse;
}