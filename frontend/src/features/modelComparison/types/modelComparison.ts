import type {
  PromptRunResponse,
} from "../../playground/types/playground";


export interface ModelComparisonTarget {
  provider: string;
  model?: string | null;
}


export interface ModelComparisonRequest {
  promptId: number;

  variables: Record<
    string,
    string
  >;

  left: ModelComparisonTarget;

  right: ModelComparisonTarget;
}


export interface ModelComparisonResult {
  left: PromptRunResponse;
  right: PromptRunResponse;
}