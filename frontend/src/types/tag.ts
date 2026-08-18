export interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TagCreate {
  name: string;
}

export interface TagUpdate {
  name?: string;
}