import { toast } from "sonner";

import type {
  PromptComparisonResponse,
} from "../types/comparison";

interface DownloadComparisonButtonProps {
  comparison: PromptComparisonResponse;
}

function createReport(
  comparison: PromptComparisonResponse,
): string {
  return `AI Prompt Studio Comparison Report

====================================

Similarity
----------
${comparison.summary.similarity.toFixed(1)}%

Characters
----------
Prompt A: ${comparison.left.statistics.characters}
Prompt B: ${comparison.right.statistics.characters}

Words
-----
Prompt A: ${comparison.left.statistics.words}
Prompt B: ${comparison.right.statistics.words}

Lines
-----
Prompt A: ${comparison.left.statistics.lines}
Prompt B: ${comparison.right.statistics.lines}

Estimated Tokens
----------------
Prompt A: ${comparison.left.statistics.estimated_tokens}
Prompt B: ${comparison.right.statistics.estimated_tokens}

Variables
---------
Prompt A: ${comparison.left.variables.length}
Prompt B: ${comparison.right.variables.length}
`;
}

export function DownloadComparisonButton({
  comparison,
}: DownloadComparisonButtonProps) {
  function handleDownload(): void {
    let url: string | null = null;

    try {
      const report = createReport(comparison);
      const blob = new Blob([report], {
        type: "text/plain;charset=utf-8",
      });

      url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "ai-prompt-studio-comparison.txt";

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Comparison report downloaded");
    } catch {
      toast.error("Could not download the report", {
        description: "Please try again.",
      });
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  }

  return (
    <button
      type="button"
      className="secondary-button"
      onClick={handleDownload}
    >
      Download Report
    </button>
  );
}