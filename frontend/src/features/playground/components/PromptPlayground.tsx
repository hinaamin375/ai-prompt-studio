import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import type {
  Prompt,
} from "../../../types/prompt";

import {
  extractVariables,
} from "../../analysis/utils/extractVariables";

import {
  listProviders,
} from "../api/providers";

import {
  runPrompt,
} from "../api/promptRuns";

import type {
  PromptRunRequest,
  PromptRunResponse,
} from "../types/playground";

import {
  ProviderSelector,
} from "./ProviderSelector";

import {
  RunResult,
} from "./RunResult";


interface PromptPlaygroundProps {
  prompt: Prompt;
}


const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_OUTPUT_TOKENS = 1000;


function formatVariableLabel(
  variableName: string,
): string {
  return variableName
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}


export function PromptPlayground({
  prompt,
}: PromptPlaygroundProps) {
  const variableNames = useMemo(() => {
    const combinedPrompt = [
      prompt.system_prompt ?? "",
      prompt.user_prompt,
    ].join("\n");

    return extractVariables(
      combinedPrompt,
    );
  }, [
    prompt.system_prompt,
    prompt.user_prompt,
  ]);


  const queryClient = useQueryClient();


  const [
    variableValues,
    setVariableValues,
  ] = useState<Record<string, string>>(
    {},
  );


  const [
    providerId,
    setProviderId,
  ] = useState("");


  const [
    model,
    setModel,
  ] = useState("");


  const [
    temperature,
    setTemperature,
  ] = useState(
    DEFAULT_TEMPERATURE,
  );


  const [
    maxOutputTokens,
    setMaxOutputTokens,
  ] = useState(
    DEFAULT_MAX_OUTPUT_TOKENS,
  );


  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: listProviders,
  });


  useEffect(() => {
    setVariableValues(
      (currentValues) => {
        const nextValues:
          Record<string, string> = {};

        for (
          const variableName
          of variableNames
        ) {
          nextValues[variableName] =
            currentValues[
              variableName
            ] ?? "";
        }

        return nextValues;
      },
    );
  }, [variableNames]);


  useEffect(() => {
    const providers =
      providersQuery.data;

    if (
      !providers ||
      providers.length === 0
    ) {
      return;
    }

    const currentProvider =
      providers.find(
        (provider) =>
          provider.id === providerId,
      );

    if (currentProvider) {
      return;
    }

    const firstProvider =
      providers[0];

    setProviderId(
      firstProvider.id,
    );

    setModel(
      firstProvider.default_model,
    );
  }, [
    providersQuery.data,
    providerId,
  ]);


  const runMutation = useMutation<
    PromptRunResponse,
    Error,
    PromptRunRequest
  >({
    mutationFn: (request) =>
      runPrompt(
        prompt.id,
        request,
      ),

    onSuccess: async () => {
      toast.success(
        "Prompt completed successfully",
      );

      await queryClient.invalidateQueries({
        queryKey: [
          "prompt-runs",
          prompt.id,
        ],
      });
    },

    onError: () => {
      toast.error(
        "Prompt execution failed",
        {
          description:
            "Check the variables, provider, and execution settings, then try again.",
        },
      );
    },
  });


  function handleVariableChange(
    variableName: string,
    value: string,
  ): void {
    setVariableValues(
      (currentValues) => ({
        ...currentValues,
        [variableName]: value,
      }),
    );
  }


  function handleProviderChange(
    nextProviderId: string,
  ): void {
    const provider =
      providersQuery.data?.find(
        (candidate) =>
          candidate.id ===
          nextProviderId,
      );

    setProviderId(
      nextProviderId,
    );

    setModel(
      provider?.default_model ?? "",
    );

    runMutation.reset();
  }


  function handleModelChange(
    nextModel: string,
  ): void {
    setModel(nextModel);

    runMutation.reset();
  }


  function handleTemperatureChange(
    value: string,
  ): void {
    const parsedValue =
      Number(value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    setTemperature(parsedValue);

    runMutation.reset();
  }


  function handleMaxOutputTokensChange(
    value: string,
  ): void {
    const parsedValue =
      Number(value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    setMaxOutputTokens(
      Math.trunc(parsedValue),
    );

    runMutation.reset();
  }


  function handleResetSettings(): void {
    setTemperature(
      DEFAULT_TEMPERATURE,
    );

    setMaxOutputTokens(
      DEFAULT_MAX_OUTPUT_TOKENS,
    );

    runMutation.reset();
  }


  function handleRun(): void {
    if (!providerId || !model) {
      toast.error(
        "Select a provider and model.",
      );

      return;
    }


    if (
      temperature < 0 ||
      temperature > 2
    ) {
      toast.error(
        "Temperature must be between 0 and 2.",
      );

      return;
    }


    if (
      !Number.isInteger(
        maxOutputTokens,
      ) ||
      maxOutputTokens < 1 ||
      maxOutputTokens > 32768
    ) {
      toast.error(
        "Max output tokens must be between 1 and 32,768.",
      );

      return;
    }


    const missingVariables =
      variableNames.filter(
        (variableName) =>
          !variableValues[
            variableName
          ]?.trim(),
      );

    if (
      missingVariables.length > 0
    ) {
      toast.error(
        "Complete all prompt variables",
        {
          description:
            missingVariables
              .map(
                (variableName) =>
                  `{{${variableName}}}`,
              )
              .join(", "),
        },
      );

      return;
    }


    runMutation.mutate({
      provider: providerId,
      model,
      variables:
        variableValues,
      temperature,
      max_output_tokens:
        maxOutputTokens,
    });
  }


  if (providersQuery.isPending) {
    return (
      <section className="playground-panel">
        <div className="analysis-empty-state">
          Loading AI providers...
        </div>
      </section>
    );
  }


  if (providersQuery.isError) {
    return (
      <section className="playground-panel">
        <div className="analysis-message-group error">
          Unable to load AI providers.
        </div>
      </section>
    );
  }


  const providers =
    providersQuery.data ?? [];


  return (
    <section className="playground-panel">
      <header className="playground-header">
        <div>
          <p className="eyebrow">
            AI Execution
          </p>

          <h2>
            Prompt Playground
          </h2>

          <p>
            Run this saved prompt against a
            configured AI provider.
          </p>
        </div>
      </header>


      <div className="playground-card">
        <div className="playground-section-heading">
          <div>
            <h3>
              Model
            </h3>

            <p>
              Choose which provider should
              execute this prompt.
            </p>
          </div>
        </div>


        {providers.length === 0 ? (
          <div className="analysis-empty-state">
            No AI providers are configured.
          </div>
        ) : (
          <ProviderSelector
            providers={providers}
            providerId={providerId}
            model={model}
            disabled={
              runMutation.isPending
            }
            onProviderChange={
              handleProviderChange
            }
            onModelChange={
              handleModelChange
            }
          />
        )}
      </div>


      <div className="playground-card">
        <div className="playground-section-heading">
          <div>
            <h3>
              Execution Settings
            </h3>

            <p>
              Control how the selected model
              generates its response.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            disabled={
              runMutation.isPending
            }
            onClick={
              handleResetSettings
            }
          >
            Reset
          </button>
        </div>


        <div className="playground-settings-grid">
          <div className="playground-field">
            <label
              htmlFor="playground-temperature"
            >
              Temperature
            </label>

            <input
              id="playground-temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              disabled={
                runMutation.isPending
              }
              onChange={(event) =>
                handleTemperatureChange(
                  event.target.value,
                )
              }
            />

            <span className="playground-field-help">
              Controls randomness. Lower
              values are more predictable;
              higher values are more varied.
              Range: 0–2.
            </span>
          </div>


          <div className="playground-field">
            <label
              htmlFor="playground-max-output-tokens"
            >
              Max Output Tokens
            </label>

            <input
              id="playground-max-output-tokens"
              type="number"
              min="1"
              max="32768"
              step="1"
              value={maxOutputTokens}
              disabled={
                runMutation.isPending
              }
              onChange={(event) =>
                handleMaxOutputTokensChange(
                  event.target.value,
                )
              }
            />

            <span className="playground-field-help">
              Maximum number of tokens the
              model may generate. Range:
              1–32,768.
            </span>
          </div>
        </div>
      </div>


      <div className="playground-card">
        <div className="playground-section-heading">
          <div>
            <h3>
              Variables
            </h3>

            <p>
              Supply values for the prompt
              template before running it.
            </p>
          </div>

          <span className="analysis-count-badge">
            {variableNames.length}
          </span>
        </div>


        {variableNames.length === 0 ? (
          <div className="analysis-empty-state">
            No template variables detected.
            This prompt can be run directly.
          </div>
        ) : (
          <div className="playground-variable-grid">
            {variableNames.map(
              (variableName) => {
                const inputId =
                  `playground-variable-${variableName}`;

                return (
                  <div
                    key={variableName}
                    className="playground-field"
                  >
                    <label
                      htmlFor={inputId}
                    >
                      {formatVariableLabel(
                        variableName,
                      )}
                    </label>

                    <input
                      id={inputId}
                      type="text"
                      value={
                        variableValues[
                          variableName
                        ] ?? ""
                      }
                      disabled={
                        runMutation.isPending
                      }
                      placeholder={
                        `Enter ${variableName}`
                      }
                      onChange={(event) =>
                        handleVariableChange(
                          variableName,
                          event.target.value,
                        )
                      }
                    />

                    <code>
                      {`{{${variableName}}}`}
                    </code>
                  </div>
                );
              },
            )}
          </div>
        )}


        <div className="playground-actions">
          <button
            type="button"
            className="primary-button"
            disabled={
              runMutation.isPending ||
              providers.length === 0 ||
              !providerId ||
              !model
            }
            onClick={handleRun}
          >
            {runMutation.isPending ? (
              <>
                <span
                  className="button-spinner"
                  aria-hidden="true"
                />

                Running...
              </>
            ) : (
              "▶ Run Prompt"
            )}
          </button>
        </div>
      </div>


      <RunResult
        result={runMutation.data}
      />
    </section>
  );
}