import type {
  PromptComparisonSummary,
} from "../types/comparison";

interface ComparisonSummaryProps {
  summary: PromptComparisonSummary;
}

interface SummaryMetricProps {
  label: string;
  value: number;
  unit?: string;
}

function formatDifference(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function describeDifference(
  value: number,
  singularName: string,
  pluralName: string,
): string {
  const amount = Math.abs(value);
  const unit =
    amount === 1
      ? singularName
      : pluralName;

  if (value > 0) {
    return `Prompt B has ${amount} more ${unit}.`;
  }

  if (value < 0) {
    return `Prompt A has ${amount} more ${unit}.`;
  }

  return `Both prompts have the same number of ${pluralName}.`;
}

function SummaryMetric({
  label,
  value,
  unit,
}: SummaryMetricProps) {
  const valueClassName =
    value > 0
      ? "comparison-metric-value positive"
      : value < 0
        ? "comparison-metric-value negative"
        : "comparison-metric-value neutral";

  return (
    <div className="comparison-metric-card">
      <span className="comparison-metric-label">
        {label}
      </span>

      <strong className={valueClassName}>
        {formatDifference(value)}
        {unit ? ` ${unit}` : ""}
      </strong>
    </div>
  );
}

export function ComparisonSummary({
  summary,
}: ComparisonSummaryProps) {
  return (
    <section className="comparison-summary-card">
      <header className="comparison-summary-header">
        <div>
          <p className="eyebrow">
            Comparison overview
          </p>

          <h2>Comparison Summary</h2>

          <p>
            Positive values mean Prompt B is larger.
            Negative values mean Prompt A is larger.
          </p>
        </div>
      </header>

      <div className="comparison-metrics-grid">
        <SummaryMetric
          label="Characters"
          value={summary.character_difference}
        />

        <SummaryMetric
          label="Words"
          value={summary.word_difference}
        />

        <SummaryMetric
          label="Lines"
          value={summary.line_difference}
        />

        <SummaryMetric
          label="Estimated Tokens"
          value={summary.token_difference}
        />

        <SummaryMetric
          label="Variables"
          value={summary.variable_difference}
        />
      </div>

      <div className="comparison-insights">
        <h3>Key Differences</h3>

        <ul>
          <li>
            {describeDifference(
              summary.character_difference,
              "character",
              "characters",
            )}
          </li>

          <li>
            {describeDifference(
              summary.word_difference,
              "word",
              "words",
            )}
          </li>

          <li>
            {describeDifference(
              summary.token_difference,
              "estimated token",
              "estimated tokens",
            )}
          </li>

          <li>
            {describeDifference(
              summary.variable_difference,
              "variable",
              "variables",
            )}
          </li>
        </ul>
      </div>
    </section>
  );
}