import { apiClient } from "../../../api/client";

import type {
  AuthSession,
  LoginInput,
  RegisterInput,
} from "../types/auth";

export async function getCurrentSession(): Promise<AuthSession> {
  const response = await apiClient.get<AuthSession>("/auth/me");
  return response.data;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>("/auth/login", input);
  return response.data;
}

export async function register(
  input: RegisterInput,
): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>(
    "/auth/register",
    input,
  );
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function selectWorkspace(
  workspaceId: number,
): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>(
    `/auth/workspaces/${workspaceId}/select`,
  );
  return response.data;
}
