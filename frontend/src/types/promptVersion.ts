export interface PromptVersion {
  id: number;
  prompt_id: number;
  version: number;

  title: string;
  description: string | null;
  system_prompt: string | null;
  user_prompt: string;

  favorite: boolean;
  collection_id: number | null;

  created_at: string;
}