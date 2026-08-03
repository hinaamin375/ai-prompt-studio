import type { PromptAnalysis } from "../types/analysis";

import { MissingVariableList } from "./MissingVariableList";
import { RenderedPrompt } from "./RenderedPrompt";
import { StatisticsCards } from "./StatisticsCards";
import { VariableList } from "./VariableList";
import { WarningList } from "./WarningList";

interface AnalysisResultProps {
  analysis?: PromptAnalysis;
  title?: string;
  showTitle?: boolean;
}

export function AnalysisResult({
  analysis,
  title = "Analysis Results",
  showTitle = false,
}: AnalysisResultProps) {
  const hasAnalysis = Boolean(analysis);

  return (
    <section className="analysis-result">
      {showTitle && (
        <header className="analysis-result-header">
          <h2>{title}</h2>
        </header>
      )}

      <div className="analysis-results-grid">
        <RenderedPrompt
          document={analysis?.rendered_document}
        />

        <StatisticsCards
          statistics={analysis?.statistics}
        />

        <VariableList
          variables={analysis?.variables}
          hasAnalysis={hasAnalysis}
        />

        <MissingVariableList
          missingVariables={
            analysis?.missing_variables
          }
          hasAnalysis={hasAnalysis}
        />

        <div className="analysis-results-full">
          <WarningList
            warnings={analysis?.warnings}
            errors={analysis?.errors}
            hasAnalysis={hasAnalysis}
          />
        </div>
      </div>
    </section>
  );
}