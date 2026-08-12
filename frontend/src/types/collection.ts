export interface Collection {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionCreate {
  name: string;
}

export interface CollectionUpdate {
  name?: string;
}