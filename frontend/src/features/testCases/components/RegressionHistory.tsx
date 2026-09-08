import type {
  PromptTestSuiteRunResponse,
} from "../types/testCase";


interface RegressionHistoryProps {
  runs: PromptTestSuiteRunResponse[];
  isLoading: boolean;
  isError: boolean;
}


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}


function formatProvider(
  provider: string,
): string {
  if (!provider) {
    return provider;
  }

  return (
    provider.charAt(0).toUpperCase()
    + provider.slice(1)
  );
}


function formatVersion(
  run: PromptTestSuiteRunResponse,
): string {
  if (run.prompt_version === null) {
    return "Version unavailable";
  }

  return (
    `Version ${run.prompt_version.version}`
  );
}


function formatTemperature(
  temperature: number | null,
): string {
  if (temperature === null) {
    return "Default";
  }

  return String(temperature);
}


function formatMaxTokens(
  maxOutputTokens: number | null,
): string {
  if (maxOutputTokens === null) {
    return "Default";
  }

  return new Intl.NumberFormat(
    "en",
  ).format(
    maxOutputTokens,
  );
}


export function RegressionHistory({
  runs,
  isLoading,
  isError,
}: RegressionHistoryProps) {
  if (isLoading) {
    return (
      <section className="regression-history">
        <div className="regression-history-heading">
          <div>
            <p className="eyebrow">
              Regression Testing
            </p>

            <h3>
              Regression History
            </h3>

            <p>
              Loading previous test suites...
            </p>
          </div>
        </div>
      </section>
    );
  }


  if (isError) {
    return (
      <section className="regression-history">
        <div className="regression-history-heading">
          <div>
            <p className="eyebrow">
              Regression Testing
            </p>

            <h3>
              Regression History
            </h3>

            <p>
              Could not load regression
              history.
            </p>
          </div>
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

          <h3>
            Regression History
          </h3>

          <p>
            Previous persisted test-suite
            executions for this prompt.
          </p>
        </div>

        <span className="regression-history-count">
          {runs.length}{" "}
          {runs.length === 1
            ? "suite"
            : "suites"}
        </span>
      </div>


      {runs.length === 0 ? (
        <div className="regression-history-empty">
          <strong>
            No regression runs yet
          </strong>

          <p>
            Run all test cases to create
            the first persisted regression
            result.
          </p>
        </div>
      ) : (
        <div className="regression-history-list">
          {runs.map((run) => {
            const suitePassed =
              run.failed_tests === 0;

            return (
              <article
                key={run.id}
                className="regression-history-card"
              >
                <div className="regression-history-card-heading">
                  <div>
                    <div className="regression-history-version-row">
                      <strong>
                        {formatVersion(run)}
                      </strong>

                      <span
                        className={
                          suitePassed
                            ? "regression-status-passed"
                            : "regression-status-failed"
                        }
                      >
                        {suitePassed
                          ? "Suite Passed"
                          : "Suite Failed"}
                      </span>
                    </div>

                    <div className="regression-history-provider">
                      <strong>
                        {formatProvider(
                          run.provider,
                        )}
                      </strong>

                      <span>
                        {run.model}
                      </span>
                    </div>
                  </div>

                  <span className="regression-history-date">
                    {formatDate(
                      run.created_at,
                    )}
                  </span>
                </div>


                <div className="regression-history-summary">
                  <div className="regression-history-stat">
                    <span>
                      Tests
                    </span>

                    <strong>
                      {run.passed_tests}
                      {" / "}
                      {run.total_tests}
                    </strong>

                    <small>
                      passed
                    </small>
                  </div>

                  <div className="regression-history-stat">
                    <span>
                      Assertions
                    </span>

                    <strong>
                      {run.passed_assertions}
                      {" / "}
                      {run.total_assertions}
                    </strong>

                    <small>
                      passed
                    </small>
                  </div>

                  <div className="regression-history-stat">
                    <span>
                      Failed Tests
                    </span>

                    <strong>
                      {run.failed_tests}
                    </strong>

                    <small>
                      total
                    </small>
                  </div>

                  <div className="regression-history-stat">
                    <span>
                      Failed Assertions
                    </span>

                    <strong>
                      {run.failed_assertions}
                    </strong>

                    <small>
                      total
                    </small>
                  </div>
                </div>


                <div className="regression-history-settings">
                  <div>
                    <span>
                      Temperature
                    </span>

                    <strong>
                      {formatTemperature(
                        run.temperature,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Max output tokens
                    </span>

                    <strong>
                      {formatMaxTokens(
                        run.max_output_tokens,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Suite ID
                    </span>

                    <strong>
                      #{run.id}
                    </strong>
                  </div>
                </div>


                <div className="regression-history-results">
                  <h4>
                    Test Results
                  </h4>

                  {run.results.map(
                    (result) => (
                      <div
                        key={result.id}
                        className="regression-history-result"
                      >
                        <div className="regression-history-result-main">
                          <span
                            className={
                              result.passed
                                ? "regression-result-icon regression-result-icon-passed"
                                : "regression-result-icon regression-result-icon-failed"
                            }
                            aria-hidden="true"
                          >
                            {result.passed
                              ? "✓"
                              : "✕"}
                          </span>

                          <div>
                            <strong>
                              {
                                result.test_case_name
                              }
                            </strong>

                            <span>
                              {
                                result.passed_count
                              }
                              {" / "}
                              {
                                result.passed_count
                                + result.failed_count
                              }
                              {" assertions passed"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={
                            result.passed
                              ? "regression-status-passed"
                              : "regression-status-failed"
                          }
                        >
                          {result.passed
                            ? "Passed"
                            : "Failed"}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}