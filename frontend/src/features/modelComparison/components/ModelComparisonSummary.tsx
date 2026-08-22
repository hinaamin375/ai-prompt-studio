import type {
  PromptRunResponse,
} from "../../playground/types/playground";


interface ModelComparisonSummaryProps {
  left: PromptRunResponse;
  right: PromptRunResponse;
}


function formatSeconds(
  milliseconds: number,
): string {
  return `${(
    milliseconds / 1000
  ).toFixed(2)} s`;
}


function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en",
  ).format(value);
}


export function ModelComparisonSummary({
  left,
  right,
}: ModelComparisonSummaryProps) {
  const durationDifference =
    Math.abs(
      left.duration_ms -
        right.duration_ms,
    );

  const fasterResult =
    left.duration_ms <=
    right.duration_ms
      ? left
      : right;


  const leftTokens =
    left.usage.total_tokens;

  const rightTokens =
    right.usage.total_tokens;


  let tokenMessage =
    "Token comparison unavailable";

  if (
    leftTokens !== null &&
    rightTokens !== null
  ) {
    const difference =
      Math.abs(
        leftTokens -
          rightTokens,
      );

    if (leftTokens === rightTokens) {
      tokenMessage =
        "Both providers reported the same total token count";
    } else {
      const lowerTokenResult =
        leftTokens < rightTokens
          ? left
          : right;

      tokenMessage =
        `${lowerTokenResult.provider} reported ` +
        `${formatNumber(difference)} fewer tokens`;
    }
  }


  return (
    <section className="model-comparison-summary">
      <div className="model-comparison-summary-header">
        <p className="eyebrow">
          Comparison Summary
        </p>

        <h3>
          Performance Overview
        </h3>
      </div>


      <div className="model-comparison-summary-grid">
        <div className="model-summary-stat">
          <span className="model-summary-label">
            Faster response
          </span>

          <strong>
            {fasterResult.provider}
          </strong>

          <span>
            {formatSeconds(
              durationDifference,
            )} faster
          </span>
        </div>


        <div className="model-summary-stat">
          <span className="model-summary-label">
            Token usage
          </span>

          <strong>
            {tokenMessage}
          </strong>

          <span>
            Provider-reported totals
          </span>
        </div>


        <div className="model-summary-stat">
          <span className="model-summary-label">
            {left.provider}
          </span>

          <strong>
            {formatSeconds(
              left.duration_ms,
            )}
          </strong>

          <span>
            {leftTokens !== null
              ? `${formatNumber(
                  leftTokens,
                )} total tokens`
              : "Token count unavailable"}
          </span>
        </div>


        <div className="model-summary-stat">
          <span className="model-summary-label">
            {right.provider}
          </span>

          <strong>
            {formatSeconds(
              right.duration_ms,
            )}
          </strong>

          <span>
            {rightTokens !== null
              ? `${formatNumber(
                  rightTokens,
                )} total tokens`
              : "Token count unavailable"}
          </span>
        </div>
      </div>
    </section>
  );
}