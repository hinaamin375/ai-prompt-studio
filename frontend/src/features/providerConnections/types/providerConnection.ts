export interface ProviderConnection {
  provider: string;
  name: string;
  connected: boolean;
  key_last_four: string | null;
  default_model: string;
  models: string[];
  status: "connected" | "not_connected";
}

export interface ProviderConnectionUpsert {
  api_key: string;
}

export interface ProviderConnectionTestResponse {
  ok: boolean;
  message: string;
}
