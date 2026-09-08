import { apiClient } from "../../../api/client";

import type {
  ProviderConnection,
  ProviderConnectionTestResponse,
  ProviderConnectionUpsert,
} from "../types/providerConnection";

export async function listProviderConnections(): Promise<
  ProviderConnection[]
> {
  const response = await apiClient.get<ProviderConnection[]>(
    "/provider-connections",
  );

  return response.data;
}

export async function connectProvider(
  providerId: string,
  data: ProviderConnectionUpsert,
): Promise<ProviderConnection> {
  const response = await apiClient.put<ProviderConnection>(
    `/provider-connections/${providerId}`,
    data,
  );

  return response.data;
}

export async function removeProviderConnection(
  providerId: string,
): Promise<void> {
  await apiClient.delete(
    `/provider-connections/${providerId}`,
  );
}

export async function testProviderConnection(
  providerId: string,
): Promise<ProviderConnectionTestResponse> {
  const response =
    await apiClient.post<ProviderConnectionTestResponse>(
      `/provider-connections/${providerId}/test`,
    );

  return response.data;
}
