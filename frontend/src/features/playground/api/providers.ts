import {
  apiClient,
} from "../../../api/client";

import type {
  Provider,
} from "../types/playground";


export async function listProviders(): Promise<
  Provider[]
> {
  const response = await apiClient.get<
    Provider[]
  >(
    "/providers",
  );

  return response.data;
}