export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
}

export interface AuthWorkspace {
  id: number;
  name: string;
  slug: string;
  role: string;
}

export interface AuthSession {
  user: AuthUser;
  workspace: AuthWorkspace;
  workspaces: AuthWorkspace[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
}
