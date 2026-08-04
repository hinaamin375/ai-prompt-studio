import type { PromptAnalysis } from "../../analysis/types/analysis";

interface ComparisonStatisticsProps {
  left: PromptAnalysis;
  right: PromptAnalysis;
}

interface StatisticRowProps {
  label: string;
  left: number;
  right: number;
}

function StatisticRow({
  label,
  left,
  right,
}: StatisticRowProps) {
  const difference = right - left;

  const className =
    difference > 0
      ? "comparison-positive"
      : difference < 0
        ? "comparison-negative"
        : "comparison-neutral";

  return (
    <tr>
      <td>{label}</td>

      <td>{left}</td>

      <td>{right}</td>

      <td className={className}>
        {difference > 0 ? "+" : ""}
        {difference}
      </td>
    </tr>
  );
}

export function ComparisonStatistics({
  left,
  right,
}: ComparisonStatisticsProps) {
  return (
    <section className="analysis-card">
      <h3>Statistics Comparison</h3>

      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Prompt A</th>
            <th>Prompt B</th>
            <th>Difference</th>
          </tr>
        </thead>

        <tbody>
          <StatisticRow
            label="Characters"
            left={left.statistics.characters}
            right={right.statistics.characters}
          />

          <StatisticRow
            label="Words"
            left={left.statistics.words}
            right={right.statistics.words}
          />

          <StatisticRow
            label="Lines"
            left={left.statistics.lines}
            right={right.statistics.lines}
          />

          <StatisticRow
            label="Estimated Tokens"
            left={left.statistics.estimated_tokens}
            right={right.statistics.estimated_tokens}
          />

          <StatisticRow
            label="Variables"
            left={left.variables.length}
            right={right.variables.length}
          />
        </tbody>
      </table>
    </section>
  );
}