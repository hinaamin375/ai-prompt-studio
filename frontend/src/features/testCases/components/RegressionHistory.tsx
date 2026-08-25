import type {
  PromptTestSuiteRunResponse,
} from "../types/testCase";


interface RegressionHistoryProps {
  runs: PromptTestSuiteRunResponse[];
  isLoading: boolean;
  isError: boolean;
}


export function RegressionHistory({
  runs,
  isLoading,
  isError,
}: RegressionHistoryProps) {
  if (isLoading) {
    return (
      <section className="regression-history">
        <div className="analysis-empty-state">
          Loading regression history...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="regression-history">
        <div className="analysis-message-group error">
          Could not load regression history.
        </div>
      </section>
    );
  }

  return (
    <section className="regression-history">
      <div className="regression-history-heading">
        <div>
          <p className="eyebrow">
            Regression Testing
          </p>

          <h2>
            Regression History
          </h2>

          <p>
            Previous persisted test suite
            executions for this prompt.
          </p>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="test-case-empty">
          <strong>
            No regression runs yet
          </strong>

          <p>
            Run all test cases to create the
            first persisted suite result.
          </p>
        </div>
      ) : (
        <div className="regression-history-list">
          {runs.map((run) => (
            <article
              key={run.id}
              className="regression-history-card"
            >
              <div className="regression-history-card-heading">
                <div>
                  <strong>
                    {run.provider}
                  </strong>

                  <span>
                    {run.model}
                  </span>
                </div>

                <span>
                  {new Date(
                    run.created_at,
                  ).toLocaleString()}
                </span>
              </div>

              <div className="test-suite-summary">
                <div>
                  <span>
                    Tests passed
                  </span>

                  <strong>
                    {run.passed_tests}
                    {" / "}
                    {run.total_tests}
                  </strong>
                </div>

                <div>
                  <span>
                    Assertions passed
                  </span>

                  <strong>
                    {run.passed_assertions}
                    {" / "}
                    {run.total_assertions}
                  </strong>
                </div>
              </div>

              <div className="regression-history-status">
                <strong
                  className={
                    run.failed_tests === 0
                      ? "regression-status-passed"
                      : "regression-status-failed"
                  }
                >
                  {run.failed_tests === 0
                    ? "✓ Suite Passed"
                    : "✗ Suite Failed"}
                </strong>
              </div>

              <div className="regression-result-list">
                {run.results.map(
                  (result) => (
                    <div
                      key={result.id}
                      className="regression-result-row"
                    >
                      <div>
                        <strong>
                          {result.passed
                            ? "✓"
                            : "✗"}
                          {" "}
                          {result.test_case_name}
                        </strong>
                      </div>

                      <span>
                        {result.passed_count}
                        {" / "}
                        {result.passed_count +
                          result.failed_count}
                        {" checks"}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="regression-history-settings">
                <span>
                  Temperature:{" "}
                  {run.temperature ?? "default"}
                </span>

                <span>
                  Max tokens:{" "}
                  {run.max_output_tokens ??
                    "default"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}