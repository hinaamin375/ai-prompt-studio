import { apiClient } from "./client";

import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
} from "../types/collection";


export async function listCollections(): Promise<
  Collection[]
> {
  const response = await apiClient.get<Collection[]>(
    "/collections",
  );

  return response.data;
}


export async function getCollection(
  collectionId: number,
): Promise<Collection> {
  const response = await apiClient.get<Collection>(
    `/collections/${collectionId}`,
  );

  return response.data;
}


export async function createCollection(
  data: CollectionCreate,
): Promise<Collection> {
  const response = await apiClient.post<Collection>(
    "/collections",
    data,
  );

  return response.data;
}


export async function updateCollection(
  collectionId: number,
  data: CollectionUpdate,
): Promise<Collection> {
  const response = await apiClient.patch<Collection>(
    `/collections/${collectionId}`,
    data,
  );

  return response.data;
}


export async function deleteCollection(
  collectionId: number,
): Promise<void> {
  await apiClient.delete(
    `/collections/${collectionId}`,
  );
}