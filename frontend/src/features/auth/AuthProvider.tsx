import {
  createContext,
  type PropsWithChildren,
  useContext,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

import {
  getCurrentSession,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  selectWorkspace as selectWorkspaceRequest,
} from "./api/auth";
import type {
  AuthSession,
  LoginInput,
  RegisterInput,
} from "./types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthSession>;
  register: (input: RegisterInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  selectWorkspace: (workspaceId: number) => Promise<AuthSession>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadSession(): Promise<AuthSession | null> {
  try {
    return await getCurrentSession();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<AuthSession | null>({
    queryKey: ["auth-session"],
    queryFn: loadSession,
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({ mutationFn: loginRequest });
  const registerMutation = useMutation({ mutationFn: registerRequest });
  const logoutMutation = useMutation({ mutationFn: logoutRequest });
  const selectWorkspaceMutation = useMutation({
    mutationFn: selectWorkspaceRequest,
  });

  async function acceptSession(nextSession: AuthSession) {
    // Product data is workspace-scoped. Never carry cached prompts, runs,
    // collections, tags, or provider state across login/workspace changes.
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "auth-session",
    });

    queryClient.setQueryData<AuthSession | null>(
      ["auth-session"],
      nextSession,
    );

    return nextSession;
  }

  return (
    <AuthContext.Provider
      value={{
        session: sessionQuery.data ?? null,
        isLoading: sessionQuery.isPending,
        login: async (input) =>
          acceptSession(await loginMutation.mutateAsync(input)),
        register: async (input) =>
          acceptSession(await registerMutation.mutateAsync(input)),
        logout: async () => {
          await logoutMutation.mutateAsync();
          queryClient.setQueryData<AuthSession | null>(
            ["auth-session"],
            null,
          );
          queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== "auth-session",
          });
        },
        selectWorkspace: async (workspaceId) =>
          acceptSession(
            await selectWorkspaceMutation.mutateAsync(workspaceId),
          ),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
