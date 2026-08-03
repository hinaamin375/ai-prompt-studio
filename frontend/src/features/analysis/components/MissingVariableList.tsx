interface MissingVariableListProps {
  missingVariables?: string[];
}

export function MissingVariableList({
  missingVariables,
}: MissingVariableListProps) {
  return (
    <section className="analysis-card">
      <h3>Missing Variables</h3>

      {!missingVariables ||
      missingVariables.length === 0 ? (
        <p>None 🎉</p>
      ) : (
        <div className="variable-list">
          {missingVariables.map((name) => (
            <div
              key={name}
              className="missing-chip"
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}