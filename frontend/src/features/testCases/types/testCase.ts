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


export interface PromptTestSuiteRunRequest {
  provider: string;
  model?: string | null;

  temperature?: number | null;
  max_output_tokens?: number | null;
}


export interface PromptVersionReference {
  id: number;
  version: number;
}


export interface PromptTestCaseResultResponse {
  id: number;

  test_case_id: number | null;
  prompt_run_id: number | null;

  test_case_name: string;

  passed: boolean;
  passed_count: number;
  failed_count: number;

  assertions: PromptTestAssertionResult[];
}


export interface PromptTestSuiteRunResponse {
  id: number;
  prompt_id: number;

  prompt_version_id: number | null;

  prompt_version:
    | PromptVersionReference
    | null;

  provider: string;
  model: string;

  temperature: number | null;
  max_output_tokens: number | null;

  total_tests: number;
  passed_tests: number;
  failed_tests: number;

  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;

  created_at: string;

  results: PromptTestCaseResultResponse[];
}


/*
 * Regression comparison
 */

export type RegressionComparisonOutcome =
  | "improved"
  | "regressed"
  | "unchanged"
  | "mixed";


export type RegressionChange =
  | "improved"
  | "regressed"
  | "unchanged"
  | "added"
  | "removed";


export interface RegressionSuiteSummaryResponse {
  suite_run_id: number;

  prompt_version_id: number | null;
  prompt_version_number: number | null;

  provider: string;
  model: string;

  temperature: number | null;
  max_output_tokens: number | null;

  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  test_pass_rate: number;

  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
}


export interface RegressionAssertionComparisonResponse {
  expected: string;

  passed_before: boolean | null;
  passed_after: boolean | null;

  change: RegressionChange;
}


export interface RegressionTestComparisonResponse {
  test_case_id_before: number | null;
  test_case_id_after: number | null;

  name_before: string | null;
  name_after: string | null;

  passed_before: boolean | null;
  passed_after: boolean | null;

  change: RegressionChange;

  assertions:
    RegressionAssertionComparisonResponse[];
}


export interface RegressionComparisonResponse {
  outcome: RegressionComparisonOutcome;

  before: RegressionSuiteSummaryResponse;
  after: RegressionSuiteSummaryResponse;

  test_pass_rate_delta: number;
  assertion_pass_rate_delta: number;

  settings_changed: boolean;

  tests: RegressionTestComparisonResponse[];
}