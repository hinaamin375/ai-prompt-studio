import { useState } from "react";

import { toast } from "sonner";

import type {
  PromptComparisonResponse,
} from "../types/comparison";

interface CopyComparisonButtonProps {
  comparison: PromptComparisonResponse;
}

function formatDifference(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function createComparisonReport(
  comparison: PromptComparisonResponse,
): string {
  return `AI Prompt Studio Comparison Report

====================================

Similarity
----------
${comparison.summary.similarity.toFixed(1)}%

Statistics
----------

Characters
A: ${comparison.left.statistics.characters}
B: ${comparison.right.statistics.characters}
Difference: ${formatDifference(
    comparison.summary.character_difference,
  )}

Words
A: ${comparison.left.statistics.words}
B: ${comparison.right.statistics.words}
Difference: ${formatDifference(
    comparison.summary.word_difference,
  )}

Lines
A: ${comparison.left.statistics.lines}
B: ${comparison.right.statistics.lines}
Difference: ${formatDifference(
    comparison.summary.line_difference,
  )}

Estimated Tokens
A: ${comparison.left.statistics.estimated_tokens}
B: ${comparison.right.statistics.estimated_tokens}
Difference: ${formatDifference(
    comparison.summary.token_difference,
  )}

Variables
A: ${comparison.left.variables.length}
B: ${comparison.right.variables.length}
Difference: ${formatDifference(
    comparison.summary.variable_difference,
  )}
`;
}

export function CopyComparisonButton({
  comparison,
}: CopyComparisonButtonProps) {
  const [isCopying, setIsCopying] = useState(false);

  async function handleCopy(): Promise<void> {
    if (isCopying) {
      return;
    }

    setIsCopying(true);

    try {
      const report = createComparisonReport(comparison);

      await navigator.clipboard.writeText(report);

      toast.success("Comparison report copied", {
        description:
          "The report is now available on your clipboard.",
      });
    } catch {
      toast.error("Could not copy the report", {
        description:
          "Check your browser clipboard permissions and try again.",
      });
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <button
      type="button"
      className="secondary-button"
      disabled={isCopying}
      onClick={handleCopy}
    >
      {isCopying ? "Copying..." : "Copy Report"}
    </button>
  );
}