import { AnalysisResult } from "../../analysis/components/AnalysisResult";

import type {
  PromptComparisonResponse,
} from "../types/comparison";

import { ComparisonStatistics } from "./ComparisonStatistics";
import { ComparisonSummary } from "./ComparisonSummary";
import { SimilarityCard } from "./SimilarityCard";
import { VariableComparison } from "./VariableComparison";
import { PromptDiff } from "./PromptDiff";
import { CopyComparisonButton } from "./CopyComparisonButton";
import { DownloadComparisonButton } from "./DownloadComparisonButton";

interface ComparisonResultsProps {
  comparison: PromptComparisonResponse;
}

export function ComparisonResults({
  comparison,
}: ComparisonResultsProps) {
  return (
    <section className="comparison-results">
      <SimilarityCard
        similarity={comparison.summary.similarity}
      />
       <div className="comparison-toolbar">
    <CopyComparisonButton
        comparison={comparison}
    />

    <DownloadComparisonButton
        comparison={comparison}
    />
</div>

      <ComparisonSummary
        summary={comparison.summary}
      />

      <ComparisonStatistics
        left={comparison.left}
        right={comparison.right}
      />

      <VariableComparison
        left={comparison.left}
        right={comparison.right}
      />

      <PromptDiff
        left={comparison.left}
        right={comparison.right}
      />

      <header className="comparison-results-header">
        <p className="eyebrow">
          Detailed Analysis
        </p>

        <h2>Side-by-Side Prompt Analysis</h2>

        <p>
          Compare the rendered prompts,
          statistics, variables, and warnings.
        </p>
      </header>

      <div className="comparison-results-layout">
        <section className="comparison-result-column">
          <AnalysisResult
            analysis={comparison.left}
            title="Prompt A"
            showTitle
          />
        </section>

        <section className="comparison-result-column">
          <AnalysisResult
            analysis={comparison.right}
            title="Prompt B"
            showTitle
          />
        </section>
      </div>
    </section>
  );
}