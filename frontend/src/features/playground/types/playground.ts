export interface Provider {
  id: string;
  name: string;
  default_model: string;
  models: string[];
}


export interface PromptRunRequest {
  provider: string;
  model?: string | null;

  variables: Record<string, string>;

  temperature?: number | null;
  max_output_tokens?: number | null;
}


export interface PromptRunUsage {
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
}


export interface PromptRunResponse {
  provider: string;
  model: string;
  output_text: string;
  duration_ms: number;
  usage: PromptRunUsage;
}