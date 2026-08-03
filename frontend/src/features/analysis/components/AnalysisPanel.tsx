import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useMutation } from "@tanstack/react-query";

import type { Prompt } from "../../../types/prompt";

import { analyzePrompt } from "../api/analysis";
import type {
  AnalyzePromptRequest,
  PromptAnalysis,
} from "../types/analysis";
import { extractVariables } from "../utils/extractVariables";

import { AnalysisResult } from "./AnalysisResult";
import { VariableForm } from "./VariableForm";

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
  }, [
    prompt.system_prompt,
    prompt.user_prompt,
  ]);

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

  const analysisMutation = useMutation<
    PromptAnalysis,
    Error,
    AnalyzePromptRequest
  >({
    mutationFn: (request) =>
      analyzePrompt(prompt.id, request),
  });

  function handleVariableChange(
    variableName: string,
    value: string,
  ): void {
    setVariableValues((currentValues) => ({
      ...currentValues,
      [variableName]: value,
    }));
  }

  function handleAnalyze(): void {
    analysisMutation.mutate({
      variables: variableValues,
    });
  }

  return (
    <section className="analysis-panel">
      <header className="analysis-panel-header">
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
      </header>

      <VariableForm
        variableNames={variableNames}
        values={variableValues}
        onChange={handleVariableChange}
        onAnalyze={handleAnalyze}
        isAnalyzing={analysisMutation.isPending}
        disabled={analysisMutation.isPending}
      />

      {analysisMutation.isError && (
        <div
          role="alert"
          className="error-banner"
        >
          Analysis failed. Please try again.
        </div>
      )}

      {analysisMutation.isSuccess && (
        <div
          role="status"
          className="analysis-complete-banner"
        >
          <span className="status-icon">
            ✓
          </span>

          Analysis completed successfully.
        </div>
      )}

      <AnalysisResult
        analysis={analysisMutation.data}
      />
    </section>
  );
}