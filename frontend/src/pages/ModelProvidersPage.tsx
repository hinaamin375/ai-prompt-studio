import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import {
  connectProvider,
  listProviderConnections,
  removeProviderConnection,
  testProviderConnection,
} from "../features/providerConnections";

import type {
  ProviderConnection,
} from "../features/providerConnections";


type ProviderTone =
  | "coral"
  | "mint"
  | "sand"
  | "lavender";


const PROVIDER_TONES: Record<string, ProviderTone> = {
  gemini: "mint",
  openai: "coral",
  anthropic: "sand",
  qwen: "lavender",
};


function ProviderGlyph({
  provider,
}: {
  provider: string;
}) {
  const label =
    provider === "openai"
      ? "◎"
      : provider === "gemini"
        ? "✦"
        : provider === "anthropic"
          ? "AI"
          : provider === "qwen"
            ? "◇"
            : "AI";

  return (
    <span
      className={`provider-connection-glyph provider-connection-glyph--${PROVIDER_TONES[provider] ?? "coral"}`}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}


function ProviderConnectionCard({
  connection,
}: {
  connection: ProviderConnection;
}) {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const connectMutation = useMutation({
    mutationFn: () =>
      connectProvider(connection.provider, {
        api_key: apiKey.trim(),
      }),
    onSuccess: async () => {
      setApiKey("");
      setIsEditing(false);
      await queryClient.invalidateQueries({
        queryKey: ["provider-connections"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["providers"],
      });
      toast.success(`${connection.name} connected.`);
    },
    onError: () => {
      toast.error(
        `Could not connect ${connection.name}. Check the API key and backend configuration.`,
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      removeProviderConnection(connection.provider),
    onSuccess: async () => {
      setApiKey("");
      setIsEditing(false);
      await queryClient.invalidateQueries({
        queryKey: ["provider-connections"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["providers"],
      });
      toast.success(`${connection.name} disconnected.`);
    },
    onError: () => {
      toast.error(`Could not disconnect ${connection.name}.`);
    },
  });

  const testMutation = useMutation({
    mutationFn: () =>
      testProviderConnection(connection.provider),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error(
        `${connection.name} connection test failed.`,
      );
    },
  });

  const isBusy =
    connectMutation.isPending ||
    removeMutation.isPending ||
    testMutation.isPending;

  function handleSave() {
    if (!apiKey.trim()) {
      toast.error("Enter an API key first.");
      return;
    }

    connectMutation.mutate();
  }

  return (
    <article className="provider-connection-card">
      <div className="provider-connection-card-top">
        <ProviderGlyph provider={connection.provider} />

        <div className="provider-connection-card-title">
          <div>
            <h2>{connection.name}</h2>
            <span
              className={
                connection.connected
                  ? "provider-connection-status provider-connection-status--connected"
                  : "provider-connection-status"
              }
            >
              <i aria-hidden="true" />
              {connection.connected
                ? "Connected"
                : "Not connected"}
            </span>
          </div>

          <p>
            {connection.models.slice(0, 3).join(" · ")}
          </p>
        </div>
      </div>

      {connection.connected && !isEditing ? (
        <div className="provider-connection-connected-body">
          <div className="provider-key-summary">
            <span>API key</span>
            <strong>
              ••••••••••••{connection.key_last_four ?? ""}
            </strong>
          </div>

          <div className="provider-default-model">
            <span>Default model</span>
            <strong>{connection.default_model}</strong>
          </div>
        </div>
      ) : (
        <div className="provider-key-editor">
          <label htmlFor={`provider-key-${connection.provider}`}>
            API key
          </label>

          <div className="provider-key-input-wrap">
            <input
              id={`provider-key-${connection.provider}`}
              type="password"
              value={apiKey}
              autoComplete="off"
              spellCheck={false}
              placeholder={`Paste your ${connection.name} API key`}
              disabled={isBusy}
              onChange={(event) =>
                setApiKey(event.target.value)
              }
            />

            <button
              type="button"
              className="provider-save-key-button"
              disabled={isBusy || !apiKey.trim()}
              onClick={handleSave}
            >
              {connectMutation.isPending
                ? "Connecting..."
                : connection.connected
                  ? "Update Key"
                  : "Connect"}
            </button>
          </div>

          <p>
            Your key is encrypted before it is stored and is
            never returned to the browser after saving.
          </p>
        </div>
      )}

      <div className="provider-connection-actions">
        {connection.connected ? (
          <>
            <button
              type="button"
              className="provider-action-button"
              disabled={isBusy}
              onClick={() => testMutation.mutate()}
            >
              {testMutation.isPending
                ? "Testing..."
                : "Test connection"}
            </button>

            <button
              type="button"
              className="provider-action-button"
              disabled={isBusy}
              onClick={() => {
                setApiKey("");
                setIsEditing((value) => !value);
              }}
            >
              {isEditing ? "Cancel" : "Replace key"}
            </button>

            <button
              type="button"
              className="provider-action-button provider-action-button--danger"
              disabled={isBusy}
              onClick={() => {
                if (
                  window.confirm(
                    `Disconnect ${connection.name}? Prompt runs using this provider will be unavailable until it is connected again.`,
                  )
                ) {
                  removeMutation.mutate();
                }
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <span className="provider-connection-hint">
            Bring your own key · Provider usage is billed by {connection.name}
          </span>
        )}
      </div>
    </article>
  );
}


export function ModelProvidersPage() {
  const connectionsQuery = useQuery({
    queryKey: ["provider-connections"],
    queryFn: listProviderConnections,
  });

  const connectedCount = useMemo(
    () =>
      connectionsQuery.data?.filter(
        (connection) => connection.connected,
      ).length ?? 0,
    [connectionsQuery.data],
  );

  return (
    <section className="model-providers-page">
      <header className="model-providers-header">
        <div>
          <span className="page-eyebrow">Bring your own key</span>
          <h1>Model Providers</h1>
          <p>
            Connect the AI providers you already use. Your model
            usage stays on your provider account, so Prompt Studio
            does not resell or mark up inference.
          </p>
        </div>

        <div className="model-providers-summary">
          <strong>{connectedCount}</strong>
          <span>
            {connectedCount === 1
              ? "provider connected"
              : "providers connected"}
          </span>
        </div>
      </header>

      <div className="provider-security-note">
        <span className="provider-security-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </span>

        <div>
          <strong>Your keys stay private</strong>
          <p>
            API keys are encrypted at rest, decrypted only for a
            provider request, and never sent back to the frontend.
          </p>
        </div>
      </div>

      {connectionsQuery.isPending && (
        <div className="provider-page-state">
          Loading model providers...
        </div>
      )}

      {connectionsQuery.isError && (
        <div className="provider-page-state provider-page-state--error">
          <strong>Could not load model providers.</strong>
          <span>
            Make sure the BYOK backend migration and API are running.
          </span>
        </div>
      )}

      {connectionsQuery.data && (
        <div className="provider-connection-grid">
          {connectionsQuery.data.map((connection) => (
            <ProviderConnectionCard
              key={connection.provider}
              connection={connection}
            />
          ))}
        </div>
      )}
    </section>
  );
}
