export interface PromptRunHistory {
  id: number;
  prompt_id: number;

  provider: string;
  model: string;

  variables: Record<string, unknown>;

  temperature: number | null;
  max_output_tokens: number | null;

  output_text: string;
  duration_ms: number;

  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;

  created_at: string;
}