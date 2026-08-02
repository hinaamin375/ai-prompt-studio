export interface PromptStatistics {
  characters: number;
  words: number;
  lines: number;
  estimated_tokens: number;
}

export interface PromptVariableOccurrence {
  name: string;
  message_index: number;
  start: number;
  end: number;
}

export interface PromptAnalysis {
  statistics: PromptStatistics;
  variables: PromptVariableOccurrence[];
  rendered_document: string;
  missing_variables: string[];
  warnings: string[];
  errors: string[];
}

export interface AnalyzePromptRequest {
  variables: Record<string, unknown>;
}