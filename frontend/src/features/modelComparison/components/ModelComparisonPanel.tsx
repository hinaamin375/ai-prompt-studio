import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
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
} from "../../playground/api/providers";

import {
  compareModels,
} from "../api/modelComparison";

import type {
  ModelComparisonRequest,
  ModelComparisonResult,
} from "../types/modelComparison";

import {
  ModelComparisonResult as ModelComparisonResultCard,
} from "./ModelComparisonResult";


interface ModelComparisonPanelProps {
  prompts: Prompt[];
}


export function ModelComparisonPanel({
  prompts,
}: ModelComparisonPanelProps) {
  const [
    promptId,
    setPromptId,
  ] = useState<number | undefined>();

  const [
    variableValues,
    setVariableValues,
  ] = useState<Record<string, string>>({});

  const [
    leftProvider,
    setLeftProvider,
  ] = useState("qwen");

  const [
    rightProvider,
    setRightProvider,
  ] = useState("gemini");


  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: listProviders,
  });


  const selectedPrompt =
    prompts.find(
      (prompt) =>
        prompt.id === promptId,
    );


  const variableNames = useMemo(() => {
    if (!selectedPrompt) {
      return [];
    }

    return extractVariables(
      [
        selectedPrompt.system_prompt ?? "",
        selectedPrompt.user_prompt,
      ].join("\n"),
    );
  }, [selectedPrompt]);


  const comparisonMutation =
    useMutation<
      ModelComparisonResult,
      Error,
      ModelComparisonRequest
    >({
      mutationFn: compareModels,

      onSuccess: () => {
        toast.success(
          "Model comparison completed",
        );
      },

      onError: () => {
        toast.error(
          "Model comparison failed",
        );
      },
    });


  function handlePromptChange(
    nextPromptId: number,
  ): void {
    setPromptId(nextPromptId);
    setVariableValues({});
    comparisonMutation.reset();
  }


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


  function handleCompare(): void {
    if (!promptId) {
      toast.error(
        "Select a prompt first",
      );

      return;
    }

    const providers =
      providersQuery.data ?? [];

    const left =
      providers.find(
        (provider) =>
          provider.id === leftProvider,
      );

    const right =
      providers.find(
        (provider) =>
          provider.id === rightProvider,
      );

    if (!left || !right) {
      toast.error(
        "Select two configured providers",
      );

      return;
    }

    comparisonMutation.mutate({
      promptId,

      variables:
        variableValues,

      left: {
        provider:
          left.id,

        model:
          left.default_model,
      },

      right: {
        provider:
          right.id,

        model:
          right.default_model,
      },
    });
  }


  const providers =
    providersQuery.data ?? [];


  return (
    <section className="model-comparison-panel">
      <header className="model-comparison-header">
        <p className="eyebrow">
          Model Comparison
        </p>

        <h2>
          Compare AI Models
        </h2>

        <p>
          Run the same prompt and variable
          values against two AI providers.
        </p>
      </header>


      <div className="model-comparison-controls">
        <div className="form-field">
          <label>
            Prompt
          </label>

          <select
            value={promptId ?? ""}
            onChange={(event) =>
              handlePromptChange(
                Number(
                  event.target.value,
                ),
              )
            }
          >
            <option value="">
              Select a prompt...
            </option>

            {prompts.map((prompt) => (
              <option
                key={prompt.id}
                value={prompt.id}
              >
                {prompt.title}
              </option>
            ))}
          </select>
        </div>


        <div className="model-comparison-provider-grid">
          <div className="form-field">
            <label>
              Model A
            </label>

            <select
              value={leftProvider}
              onChange={(event) =>
                setLeftProvider(
                  event.target.value,
                )
              }
            >
              {providers.map(
                (provider) => (
                  <option
                    key={provider.id}
                    value={provider.id}
                  >
                    {provider.name}
                  </option>
                ),
              )}
            </select>
          </div>


          <div className="form-field">
            <label>
              Model B
            </label>

            <select
              value={rightProvider}
              onChange={(event) =>
                setRightProvider(
                  event.target.value,
                )
              }
            >
              {providers.map(
                (provider) => (
                  <option
                    key={provider.id}
                    value={provider.id}
                  >
                    {provider.name}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>


        {selectedPrompt && (
          <div className="model-comparison-variables">
            <h3>Variables</h3>

            {variableNames.length === 0 ? (
              <p>
                No variables detected.
              </p>
            ) : (
              variableNames.map(
                (variableName) => (
                  <div
                    key={variableName}
                    className="form-field"
                  >
                    <label>
                      {variableName}
                    </label>

                    <input
                      value={
                        variableValues[
                          variableName
                        ] ?? ""
                      }
                      onChange={(event) =>
                        handleVariableChange(
                          variableName,
                          event.target.value,
                        )
                      }
                    />
                  </div>
                ),
              )
            )}
          </div>
        )}


        <div className="comparison-actions">
          <button
            type="button"
            className="primary-button"
            disabled={
              !promptId ||
              comparisonMutation.isPending
            }
            onClick={handleCompare}
          >
            {comparisonMutation.isPending
              ? "Comparing..."
              : "Compare Models"}
          </button>
        </div>
      </div>


      <div className="model-comparison-results">
        <ModelComparisonResultCard
          title={
            providers.find(
              (provider) =>
                provider.id === leftProvider,
            )?.name ?? "Model A"
          }
          result={
            comparisonMutation.data?.left
          }
        />

        <ModelComparisonResultCard
          title={
            providers.find(
              (provider) =>
                provider.id === rightProvider,
            )?.name ?? "Model B"
          }
          result={
            comparisonMutation.data?.right
          }
        />
      </div>
    </section>
  );
}