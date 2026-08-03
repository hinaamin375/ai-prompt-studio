import type { PromptVariableOccurrence } from "../types/analysis";

interface VariableListProps {
  variables?: PromptVariableOccurrence[];
}

export function VariableList({
  variables,
}: VariableListProps) {
  return (
    <section className="analysis-card">
      <h3>Variables Found</h3>

      {!variables || variables.length === 0 ? (
        <p>No variables detected.</p>
      ) : (
        <div className="variable-list">
          {variables.map((variable, index) => (
            <div
              key={`${variable.name}-${index}`}
              className="variable-chip"
            >
              <strong>{variable.name}</strong>

              <span>
                Position {variable.start}–{variable.end}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}