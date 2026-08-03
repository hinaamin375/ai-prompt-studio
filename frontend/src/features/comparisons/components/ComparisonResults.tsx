import { AnalysisResult } from "../../analysis/components/AnalysisResult";

import type {
  PromptComparisonResponse,
} from "../types/comparison";

interface ComparisonResultsProps {
  comparison: PromptComparisonResponse;
}

export function ComparisonResults({
  comparison,
}: ComparisonResultsProps) {
  return (
    <section className="comparison-results">
      <header className="comparison-results-header">
        <p className="eyebrow">
          Prompt Engine
        </p>

        <h2>Comparison Results</h2>

        <p>
          Review both analyzed prompts side by side.
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