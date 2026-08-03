interface VariableFormProps {
  variableNames: string[];
  values: Record<string, string>;
  onChange: (
    variableName: string,
    value: string,
  ) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
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
  onAnalyze,
  isAnalyzing,
  disabled = false,
}: VariableFormProps) {
  return (
    <section className="analysis-card">
      <div className="analysis-section-header">
        <div>
          <h3>Variables</h3>

          <p>
            Enter values for every detected
            template variable.
          </p>
        </div>

        <span className="analysis-count-badge">
          {variableNames.length}
        </span>
      </div>

      {variableNames.length === 0 ? (
        <div className="analysis-empty-state">
          No template variables detected.
        </div>
      ) : (
        <>
          <div className="analysis-variable-grid">
            {variableNames.map((variableName) => {
              const inputId =
                `analysis-variable-${variableName}`;

              return (
                <div
                  key={variableName}
                  className="analysis-variable-field"
                >
                  <label htmlFor={inputId}>
                    {formatVariableLabel(
                      variableName,
                    )}
                  </label>

                  <input
                    id={inputId}
                    type="text"
                    value={
                      values[variableName] ?? ""
                    }
                    disabled={disabled}
                    placeholder={`Enter ${variableName}`}
                    onChange={(event) =>
                      onChange(
                        variableName,
                        event.target.value,
                      )
                    }
                  />

                  <code>
                    {`{{${variableName}}}`}
                  </code>
                </div>
              );
            })}
          </div>

          <div className="analysis-variable-actions">
            <button
              type="button"
              className="primary-button"
              onClick={onAnalyze}
              disabled={
                disabled || isAnalyzing
              }
            >
              {isAnalyzing ? (
                <>
                  <span
                    className="button-spinner"
                    aria-hidden="true"
                  />

                  Analyzing...
                </>
              ) : (
                "Analyze Prompt"
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}