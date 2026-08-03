import type { PromptStatistics } from "../types/analysis";

interface StatisticsCardsProps {
  statistics?: PromptStatistics;
}

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-label">
        {label}
      </span>

      <span className="stat-value">
        {value}
      </span>
    </div>
  );
}

export function StatisticsCards({
  statistics,
}: StatisticsCardsProps) {
  return (
    <section className="analysis-card">
      <h3>Statistics</h3>

      {!statistics ? (
        <p>No statistics yet.</p>
      ) : (
        <div className="statistics-grid">
          <StatCard
            label="Characters"
            value={statistics.characters}
          />

          <StatCard
            label="Words"
            value={statistics.words}
          />

          <StatCard
            label="Lines"
            value={statistics.lines}
          />

          <StatCard
            label="Estimated Tokens"
            value={statistics.estimated_tokens}
          />
        </div>
      )}
    </section>
  );
}