import { useEffect, useMemo, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { analyzePrompt } from "../api/analysis";
import type {
  AnalyzePromptRequest,
  PromptAnalysis,
} from "../types/analysis";
import { extractVariables } from "../utils/extractVariables";

import { MissingVariableList } from "./MissingVariableList";
import { RenderedPrompt } from "./RenderedPrompt";
import { StatisticsCards } from "./StatisticsCards";
import { VariableForm } from "./VariableForm";
import { VariableList } from "./VariableList";
import { WarningList } from "./WarningList";

import type { Prompt } from "../../../types/prompt";

interface AnalysisPanelProps {
  prompt: Prompt;
}

export function AnalysisPanel({
  prompt,
}: AnalysisPanelProps) {
  const variableNames = useMemo(() => {
    const combinedPrompt = [
      prompt.system_prompt ?? "",
      prompt.user_prompt,
    ].join("\n");

    return extractVariables(combinedPrompt);
  }, [prompt]);

  const [variableValues, setVariableValues] =
    useState<Record<string, string>>({});

  useEffect(() => {
    setVariableValues((currentValues) => {
      const nextValues: Record<string, string> = {};

      for (const variableName of variableNames) {
        nextValues[variableName] =
          currentValues[variableName] ?? "";
      }

      return nextValues;
    });
  }, [variableNames]);

  function handleVariableChange(
    variableName: string,
    value: string,
  ): void {
    setVariableValues((currentValues) => ({
      ...currentValues,
      [variableName]: value,
    }));
  }

  const analysisMutation = useMutation<
    PromptAnalysis,
    Error,
    AnalyzePromptRequest
  >({
    mutationFn: (request) =>
      analyzePrompt(prompt.id, request),
  });

  async function handleAnalyze() {
    await analysisMutation.mutateAsync({
      variables: variableValues,
    });
  }

  return (
    <section className="analysis-panel">
      <div className="analysis-panel-header">
        <div>
          <p className="eyebrow">
            Prompt Engine
          </p>

          <h2>Prompt Analysis</h2>

          <p>
            Supply values for detected variables and
            analyze the rendered prompt.
          </p>
        </div>
      </div>

      <VariableForm
        variableNames={variableNames}
        values={variableValues}
        onChange={handleVariableChange}
        disabled={analysisMutation.isPending}
      />

      <div className="analysis-actions">
        <button
          type="button"
          className="primary-button"
          disabled={analysisMutation.isPending}
          onClick={handleAnalyze}
        >
          {analysisMutation.isPending
            ? "Analyzing..."
            : "Analyze Prompt"}
        </button>
      </div>

      {analysisMutation.isError && (
        <div
          role="alert"
          className="error-banner"
        >
          Analysis failed. Please try again.
        </div>
      )}

      {/* {analysisMutation.data && (
        <pre
          style={{
            marginTop: "20px",
            overflow: "auto",
            background: "#111827",
            color: "#ffffff",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "0.875rem",
          }}
        >
          {JSON.stringify(
            analysisMutation.data,
            null,
            2,
          )}
        </pre>
      )} */}

     <RenderedPrompt
  document={analysisMutation.data?.rendered_document}
/>

     <StatisticsCards
  statistics={analysisMutation.data?.statistics}
/>

    <VariableList
    variables={analysisMutation.data?.variables}
/>

     <MissingVariableList
    missingVariables={
        analysisMutation.data?.missing_variables
    }
/>

     <WarningList
    warnings={analysisMutation.data?.warnings}
    errors={analysisMutation.data?.errors}
/>
    </section>
  );
}