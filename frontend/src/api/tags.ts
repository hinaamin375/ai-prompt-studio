import { apiClient } from "./client";

import type {
  Tag,
  TagCreate,
  TagUpdate,
} from "../types/tag";


export async function listTags(): Promise<Tag[]> {
  const response = await apiClient.get<Tag[]>(
    "/tags",
  );

  return response.data;
}


export async function getTag(
  tagId: number,
): Promise<Tag> {
  const response = await apiClient.get<Tag>(
    `/tags/${tagId}`,
  );

  return response.data;
}


export async function createTag(
  data: TagCreate,
): Promise<Tag> {
  const response = await apiClient.post<Tag>(
    "/tags",
    data,
  );

  return response.data;
}


export async function updateTag(
  tagId: number,
  data: TagUpdate,
): Promise<Tag> {
  const response = await apiClient.patch<Tag>(
    `/tags/${tagId}`,
    data,
  );

  return response.data;
}


export async function deleteTag(
  tagId: number,
): Promise<void> {
  await apiClient.delete(
    `/tags/${tagId}`,
  );
}