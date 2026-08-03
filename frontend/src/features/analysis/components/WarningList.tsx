interface WarningListProps {
  warnings?: string[];
  errors?: string[];
  hasAnalysis?: boolean;
}

export function WarningList({
  warnings = [],
  errors = [],
  hasAnalysis = false,
}: WarningListProps) {
  const hasWarnings =
    warnings.length > 0;

  const hasErrors =
    errors.length > 0;

  return (
    <section className="analysis-card">
      <h3>Analysis Status</h3>

      {!hasAnalysis ? (
        <div className="analysis-empty-state">
          Run an analysis to inspect warnings
          and errors.
        </div>
      ) : !hasWarnings && !hasErrors ? (
        <div className="analysis-success-state">
          <span className="status-icon">
            ✓
          </span>

          <div>
            <strong>
              Analysis completed successfully
            </strong>

            <p>
              No warnings or errors were
              detected.
            </p>
          </div>
        </div>
      ) : (
        <>
          {hasErrors && (
            <div className="analysis-message-group error">
              <h4>Errors</h4>

              <ul>
                {errors.map((error) => (
                  <li key={error}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasWarnings && (
            <div className="analysis-message-group warning">
              <h4>Warnings</h4>

              <ul>
                {warnings.map((warning) => (
                  <li key={warning}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}