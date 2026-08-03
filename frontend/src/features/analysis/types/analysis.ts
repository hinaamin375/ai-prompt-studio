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

export interface RenderedMessage {
  role: string;
  content: string;
}

export interface RenderedDocument {
  title: string;
  description: string | null;
  messages: RenderedMessage[];
  variables: string[];
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface PromptAnalysis {
  statistics: PromptStatistics;
  variables: PromptVariableOccurrence[];
  rendered_document: RenderedDocument;
  missing_variables: string[];
  warnings: string[];
  errors: string[];
}

export interface AnalyzePromptRequest {
  variables: Record<string, unknown>;
}