export interface Prompt {
  id: number;
  title: string;
  description: string | null;
  system_prompt: string | null;
  user_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface PromptCreate {
  title: string;
  description: string | null;
  system_prompt: string | null;
  user_prompt: string;
}

export interface PromptUpdate {
  title?: string;
  description?: string | null;
  system_prompt?: string | null;
  user_prompt?: string;
}