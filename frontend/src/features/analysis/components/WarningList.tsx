interface WarningListProps {
  warnings?: string[];
  errors?: string[];
}

export function WarningList({
  warnings,
  errors,
}: WarningListProps) {
  return (
    <section className="analysis-card">
      <h3>Warnings & Errors</h3>

      {warnings?.length ? (
        <>
          <h4>Warnings</h4>

          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>No warnings.</p>
      )}

      {errors?.length ? (
        <>
          <h4>Errors</h4>

          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>No errors.</p>
      )}
    </section>
  );
}