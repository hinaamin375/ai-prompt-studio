interface VariableFormProps {
  variableNames: string[];
  values: Record<string, string>;
  onChange: (
    variableName: string,
    value: string,
  ) => void;
  disabled?: boolean;
}

function formatVariableLabel(
  variableName: string,
): string {
  return variableName
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function VariableForm({
  variableNames,
  values,
  onChange,
  disabled = false,
}: VariableFormProps) {
  return (
    <section className="analysis-card">
      <div className="analysis-section-header">
        <div>
          <h3>Variables</h3>

          <p>
            Enter values for the variables detected in
            this prompt.
          </p>
        </div>

        <span className="analysis-count-badge">
          {variableNames.length}
        </span>
      </div>

      {variableNames.length === 0 ? (
        <div className="analysis-empty-state">
          No template variables were detected.
        </div>
      ) : (
        <div className="analysis-variable-grid">
          {variableNames.map((variableName) => {
            const inputId = `analysis-variable-${variableName}`;

            return (
              <div
                className="analysis-variable-field"
                key={variableName}
              >
                <label htmlFor={inputId}>
                  {formatVariableLabel(variableName)}
                </label>

                <input
                  id={inputId}
                  type="text"
                  value={values[variableName] ?? ""}
                  placeholder={`Enter ${variableName}`}
                  disabled={disabled}
                  onChange={(event) =>
                    onChange(
                      variableName,
                      event.target.value,
                    )
                  }
                />

                <code>{`{{${variableName}}}`}</code>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}