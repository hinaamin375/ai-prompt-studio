import type { PromptStatistics } from "../types/analysis";

interface StatisticsCardsProps {
  statistics?: PromptStatistics;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
}

function StatCard({
  label,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>
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
        <div className="analysis-empty-state">
          Analyze the prompt to calculate
          statistics.
        </div>
      ) : (
        <div className="statistics-grid">
          <StatCard
            icon="Aa"
            label="Characters"
            value={statistics.characters}
          />

          <StatCard
            icon="W"
            label="Words"
            value={statistics.words}
          />

          <StatCard
            icon="≡"
            label="Lines"
            value={statistics.lines}
          />

          <StatCard
            icon="#"
            label="Tokens"
            value={statistics.estimated_tokens}
          />
        </div>
      )}
    </section>
  );
}