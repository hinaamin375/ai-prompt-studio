interface MissingVariableListProps {
  missingVariables?: string[];
  hasAnalysis?: boolean;
}

export function MissingVariableList({
  missingVariables = [],
  hasAnalysis = false,
}: MissingVariableListProps) {
  return (
    <section className="analysis-card">
      <h3>Missing Variables</h3>

      {!hasAnalysis ? (
        <div className="analysis-empty-state">
          Run an analysis to check for missing
          variables.
        </div>
      ) : missingVariables.length === 0 ? (
        <div className="analysis-success-state">
          <span className="status-icon">
            ✓
          </span>

          <div>
            <strong>
              All variables supplied
            </strong>

            <p>
              Every detected variable has a value.
            </p>
          </div>
        </div>
      ) : (
        <div className="variable-list">
          {missingVariables.map((variable) => (
            <div
              key={variable}
              className="missing-chip"
            >
              {`{{${variable}}}`}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}