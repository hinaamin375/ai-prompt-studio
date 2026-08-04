import { useState } from "react";
import { toast } from "sonner";
import type { Prompt } from "../../../types/prompt";

import { PromptSelectionPanel } from "./PromptSelectionPanel";
import { ComparisonResults } from "./ComparisonResults";

import { useComparePrompts } from "../hooks/useComparePrompts";

export interface PromptSelection {
  promptId?: number;
  variables: Record<string, string>;
}

interface PromptComparisonPanelProps {
  prompts: Prompt[];
}

export function PromptComparisonPanel({
  prompts,
}: PromptComparisonPanelProps) {
  const [left, setLeft] = useState<PromptSelection>({
    variables: {},
  });

  const [right, setRight] = useState<PromptSelection>({
    variables: {},
  });

  const compareMutation = useComparePrompts();

  const canCompare =
    left.promptId !== undefined &&
    right.promptId !== undefined;

  function compare() {
    if (!canCompare) {
         toast.error("Select two prompts first");
      return;
    }

    compareMutation.mutate({
      left_prompt_id: left.promptId!,
      right_prompt_id: right.promptId!,
      left_variables: left.variables,
      right_variables: right.variables,
    },
    {
      onSuccess: () => {
        toast.success("Prompt comparison completed");
      },

      onError: () => {
        toast.error("Prompt comparison failed", {
          description:
            "Check both prompts and variable values.",
        });
      },
    });
  }

  return (
    <>
      <div className="comparison-layout">
        <PromptSelectionPanel
          title="Prompt A"
          prompts={prompts}
          selection={left}
          onChange={setLeft}
        />

        <PromptSelectionPanel
          title="Prompt B"
          prompts={prompts}
          selection={right}
          onChange={setRight}
        />
      </div>

      <div className="comparison-actions">
        <button
          className="primary-button"
          disabled={!canCompare || compareMutation.isPending}
          onClick={compare}
        >
          {compareMutation.isPending
            ? "Comparing..."
            : "Compare Prompts"}
        </button>
      </div>

      {compareMutation.data && (
        <ComparisonResults
          comparison={compareMutation.data}
        />
      )}
    </>
  );
}