import type {
  RegressionChange,
  RegressionComparisonResponse,
  RegressionSuiteSummaryResponse,
} from "../types/testCase";


interface RegressionComparisonPanelProps {
  comparison:
    RegressionComparisonResponse | undefined;

  isLoading: boolean;
  isError: boolean;
}


function formatOutcome(
  value: string,
): string {
  return value.toUpperCase();
}


function formatVersion(
  suite: RegressionSuiteSummaryResponse,
): string {
  if (
    suite.prompt_version_number === null
  ) {
    return "Version unavailable";
  }

  return (
    `Version ${suite.prompt_version_number}`
  );
}


function formatPercentage(
  value: number,
): string {
  return `${value.toFixed(1)}%`;
}


function formatDelta(
  value: number,
): string {
  if (value > 0) {
    return `+${value.toFixed(1)} pp`;
  }

  return `${value.toFixed(1)} pp`;
}


function formatTemperature(
  value: number | null,
): string {
  if (value === null) {
    return "Default";
  }

  return String(value);
}


function formatMaxTokens(
  value: number | null,
): string {
  if (value === null) {
    return "Default";
  }

  return new Intl.NumberFormat(
    "en",
  ).format(value);
}


function formatStatus(
  value: boolean | null,
): string {
  if (value === null) {
    return "—";
  }

  return value
    ? "Passed"
    : "Failed";
}


function changeLabel(
  change: RegressionChange,
): string {
  switch (change) {
    case "improved":
      return "Improved";

    case "regressed":
      return "Regressed";

    case "added":
      return "Added";

    case "removed":
      return "Removed";

    default:
      return "Unchanged";
  }
}


function changeClass(
  change: RegressionChange,
): string {
  return (
    `regression-change-badge `
    + `regression-change-${change}`
  );
}


export function RegressionComparisonPanel({
  comparison,
  isLoading,
  isError,
}: RegressionComparisonPanelProps) {
  if (isLoading) {
    return (
      <section className="regression-comparison-panel">
        <div className="regression-comparison-state">
          <strong>
            Comparing regression suites...
          </strong>

          <span>
            Reading persisted suite results.
          </span>
        </div>
      </section>
    );
  }


  if (isError) {
    return (
      <section className="regression-comparison-panel">
        <div className="regression-comparison-state regression-comparison-state-error">
          <strong>
            Could not compare suites
          </strong>

          <span>
            Check the selected regression
            runs and try again.
          </span>
        </div>
      </section>
    );
  }


  if (!comparison) {
    return null;
  }


  const {
    before,
    after,
  } = comparison;


  return (
    <section className="regression-comparison-panel">
      <div className="regression-comparison-heading">
        <div>
          <p className="eyebrow">
            Regression Analysis
          </p>

          <h3>
            Regression Comparison
          </h3>

          <p>
            Deterministic comparison of two
            persisted regression suite runs.
          </p>
        </div>

        <span
          className={
            `regression-comparison-outcome `
            + `regression-comparison-outcome-${comparison.outcome}`
          }
        >
          {formatOutcome(
            comparison.outcome,
          )}
        </span>
      </div>


      <div className="regression-comparison-direction">
        <div className="regression-comparison-version">
          <span>
            Baseline
          </span>

          <strong>
            {formatVersion(before)}
          </strong>

          <small>
            Suite #{before.suite_run_id}
          </small>
        </div>

        <div
          className="regression-comparison-arrow"
          aria-hidden="true"
        >
          →
        </div>

        <div className="regression-comparison-version">
          <span>
            Candidate
          </span>

          <strong>
            {formatVersion(after)}
          </strong>

          <small>
            Suite #{after.suite_run_id}
          </small>
        </div>
      </div>


      <div className="regression-comparison-metrics">
        <div className="regression-comparison-metric">
          <span>
            Test Pass Rate
          </span>

          <div className="regression-comparison-metric-values">
            <strong>
              {formatPercentage(
                before.test_pass_rate,
              )}
            </strong>

            <span>
              →
            </span>

            <strong>
              {formatPercentage(
                after.test_pass_rate,
              )}
            </strong>
          </div>

          <small>
            {before.passed_tests}
            {" / "}
            {before.total_tests}
            {" → "}
            {after.passed_tests}
            {" / "}
            {after.total_tests}
          </small>

          <span className="regression-comparison-delta">
            Delta:{" "}
            {formatDelta(
              comparison.test_pass_rate_delta,
            )}
          </span>
        </div>


        <div className="regression-comparison-metric">
          <span>
            Assertion Pass Rate
          </span>

          <div className="regression-comparison-metric-values">
            <strong>
              {formatPercentage(
                before.assertion_pass_rate,
              )}
            </strong>

            <span>
              →
            </span>

            <strong>
              {formatPercentage(
                after.assertion_pass_rate,
              )}
            </strong>
          </div>

          <small>
            {before.passed_assertions}
            {" / "}
            {before.total_assertions}
            {" → "}
            {after.passed_assertions}
            {" / "}
            {after.total_assertions}
          </small>

          <span className="regression-comparison-delta">
            Delta:{" "}
            {formatDelta(
              comparison
                .assertion_pass_rate_delta,
            )}
          </span>
        </div>
      </div>


      <div className="regression-comparison-settings">
        <div className="regression-comparison-section-heading">
          <div>
            <h4>
              Execution Settings
            </h4>

            <p>
              Provider and generation settings
              used by each persisted suite.
            </p>
          </div>

          {comparison.settings_changed && (
            <span className="regression-settings-changed">
              Settings changed
            </span>
          )}
        </div>


        <div className="regression-settings-table">
          <div className="regression-settings-row regression-settings-header">
            <span>
              Setting
            </span>

            <strong>
              Baseline
            </strong>

            <strong>
              Candidate
            </strong>
          </div>

          <div className="regression-settings-row">
            <span>
              Provider
            </span>

            <strong>
              {before.provider}
            </strong>

            <strong>
              {after.provider}
            </strong>
          </div>

          <div className="regression-settings-row">
            <span>
              Model
            </span>

            <strong>
              {before.model}
            </strong>

            <strong>
              {after.model}
            </strong>
          </div>

          <div className="regression-settings-row">
            <span>
              Temperature
            </span>

            <strong>
              {formatTemperature(
                before.temperature,
              )}
            </strong>

            <strong>
              {formatTemperature(
                after.temperature,
              )}
            </strong>
          </div>

          <div className="regression-settings-row">
            <span>
              Max output tokens
            </span>

            <strong>
              {formatMaxTokens(
                before.max_output_tokens,
              )}
            </strong>

            <strong>
              {formatMaxTokens(
                after.max_output_tokens,
              )}
            </strong>
          </div>
        </div>
      </div>


      <div className="regression-comparison-tests">
        <div className="regression-comparison-section-heading">
          <div>
            <h4>
              Test Changes
            </h4>

            <p>
              Historical test snapshots from
              the selected suite runs.
            </p>
          </div>

          <span>
            {comparison.tests.length}{" "}
            {comparison.tests.length === 1
              ? "test"
              : "tests"}
          </span>
        </div>


        <div className="regression-comparison-test-list">
          {comparison.tests.map(
            (test, index) => {
              const displayName =
                test.name_after
                ?? test.name_before
                ?? "Unknown test";

              return (
                <article
                  key={
                    `${test.test_case_id_before}`
                    + `-${test.test_case_id_after}`
                    + `-${index}`
                  }
                  className="regression-comparison-test"
                >
                  <div className="regression-comparison-test-heading">
                    <div>
                      <strong>
                        {displayName}
                      </strong>

                      {test.name_before
                        && test.name_after
                        && test.name_before
                          !== test.name_after && (
                          <span>
                            Renamed from{" "}
                            "{test.name_before}"
                          </span>
                        )}
                    </div>

                    <span
                      className={
                        changeClass(
                          test.change,
                        )
                      }
                    >
                      {changeLabel(
                        test.change,
                      )}
                    </span>
                  </div>


                  <div className="regression-test-status-transition">
                    <span>
                      {formatStatus(
                        test.passed_before,
                      )}
                    </span>

                    <span
                      aria-hidden="true"
                    >
                      →
                    </span>

                    <span>
                      {formatStatus(
                        test.passed_after,
                      )}
                    </span>
                  </div>


                  {test.assertions.length > 0 && (
                    <div className="regression-comparison-assertions">
                      <h5>
                        Assertions
                      </h5>

                      {test.assertions.map(
                        (
                          assertion,
                          assertionIndex,
                        ) => (
                          <div
                            key={
                              `${assertion.expected}`
                              + `-${assertionIndex}`
                            }
                            className="regression-comparison-assertion"
                          >
                            <code>
                              {
                                assertion.expected
                              }
                            </code>

                            <div className="regression-assertion-transition">
                              <span>
                                {formatStatus(
                                  assertion
                                    .passed_before,
                                )}
                              </span>

                              <span
                                aria-hidden="true"
                              >
                                →
                              </span>

                              <span>
                                {formatStatus(
                                  assertion
                                    .passed_after,
                                )}
                              </span>
                            </div>

                            <span
                              className={
                                changeClass(
                                  assertion.change,
                                )
                              }
                            >
                              {changeLabel(
                                assertion.change,
                              )}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </article>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}