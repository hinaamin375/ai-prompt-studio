import type { Tag } from "./tag";


export interface Prompt {
  id: number;
  title: string;
  description: string | null;
  system_prompt: string | null;
  user_prompt: string;
  favorite: boolean;
  collection_id: number | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}


export interface PromptCreate {
  title: string;
  description: string | null;
  system_prompt: string | null;
  user_prompt: string;
  favorite?: boolean;
  collection_id?: number | null;
  tag_ids?: number[];
}


export interface PromptUpdate {
  title?: string;
  description?: string | null;
  system_prompt?: string | null;
  user_prompt?: string;
  favorite?: boolean;
  collection_id?: number | null;
  tag_ids?: number[];
}