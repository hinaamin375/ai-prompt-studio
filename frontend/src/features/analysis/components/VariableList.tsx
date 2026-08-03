import type {
  PromptVariableOccurrence,
} from "../types/analysis";

interface VariableListProps {
  variables?: PromptVariableOccurrence[];
  hasAnalysis?: boolean;
}

export function VariableList({
  variables = [],
  hasAnalysis = false,
}: VariableListProps) {
  return (
    <section className="analysis-card">
      <div className="analysis-card-header">
        <h3>Variables Found</h3>

        {hasAnalysis && (
          <span className="analysis-count-badge">
            {variables.length}
          </span>
        )}
      </div>

      {!hasAnalysis ? (
        <div className="analysis-empty-state">
          Run an analysis to inspect variable positions.
        </div>
      ) : variables.length === 0 ? (
        <div className="analysis-empty-state">
          No template variables were found.
        </div>
      ) : (
        <div className="variable-list">
          {variables.map((variable, index) => (
            <div
              key={`${variable.name}-${variable.message_index}-${index}`}
              className="variable-chip"
            >
              <div className="variable-chip-name">
                {`{{${variable.name}}}`}
              </div>

              <div className="variable-chip-meta">
                <span>
                  Message {variable.message_index + 1}
                </span>

                <span>
                  Characters {variable.start}–{variable.end}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}