import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  PromptRunHistory,
} from "../types/runHistory";


interface RunHistoryComparisonProps {
  runA: PromptRunHistory;
  runB: PromptRunHistory;
  onClose: () => void;
}


function formatDuration(
  durationMs: number,
): string {
  return `${(
    durationMs / 1000
  ).toFixed(2)} s`;
}


function formatTokens(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en",
  ).format(value);
}
function formatTemperature(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  return value.toString();
}


function formatMaxOutputTokens(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en",
  ).format(value);
}

function providerLabel(
  provider: string,
): string {
  return (
    provider.charAt(0).toUpperCase() +
    provider.slice(1)
  );
}


export function RunHistoryComparison({
  runA,
  runB,
  onClose,
}: RunHistoryComparisonProps) {
  const fasterRun =
    runA.duration_ms === runB.duration_ms
      ? null
      : runA.duration_ms < runB.duration_ms
        ? runA
        : runB;


  const runATokens =
    runA.total_tokens;

  const runBTokens =
    runB.total_tokens;


  let fewerTokensRun:
    | PromptRunHistory
    | null = null;

  if (
    runATokens !== null &&
    runBTokens !== null &&
    runATokens !== runBTokens
  ) {
    fewerTokensRun =
      runATokens < runBTokens
        ? runA
        : runB;
  }


  return (
    <section className="run-history-comparison">
      <div className="run-history-comparison-heading">
        <div>
          <p className="eyebrow">
            Run Comparison
          </p>

          <h3>
            Compare Executions
          </h3>

          <p>
            Compare model usage,
            performance, and output from
            two previous runs.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onClose}
        >
          Close Comparison
        </button>
      </div>


      <div className="run-history-comparison-summary">
        <div>
          <span>
            Faster response
          </span>

          <strong>
            {fasterRun
              ? providerLabel(
                  fasterRun.provider,
                )
              : "Tie"}
          </strong>
        </div>

        <div>
          <span>
            Fewer tokens
          </span>

          <strong>
            {fewerTokensRun
              ? providerLabel(
                  fewerTokensRun.provider,
                )
              : "Tie / unavailable"}
          </strong>
        </div>
      </div>


      <div className="run-history-comparison-table">
        <div className="run-comparison-row run-comparison-header">
          <span />

          <strong>
            Run A
          </strong>

          <strong>
            Run B
          </strong>
        </div>


        <div className="run-comparison-row">
          <span>
            Provider
          </span>

          <strong>
            {providerLabel(
              runA.provider,
            )}
          </strong>

          <strong>
            {providerLabel(
              runB.provider,
            )}
          </strong>
        </div>


        <div className="run-comparison-row">
          <span>
            Model
          </span>

          <span>
            {runA.model}
          </span>

          <span>
            {runB.model}
          </span>
        </div>
<div className="run-comparison-row">
  <span>
    Temperature
  </span>

  <span>
    {formatTemperature(
      runA.temperature,
    )}
  </span>

  <span>
    {formatTemperature(
      runB.temperature,
    )}
  </span>
</div>


<div className="run-comparison-row">
  <span>
    Max output tokens
  </span>

  <span>
    {formatMaxOutputTokens(
      runA.max_output_tokens,
    )}
  </span>

  <span>
    {formatMaxOutputTokens(
      runB.max_output_tokens,
    )}
  </span>
</div>

        <div className="run-comparison-row">
          <span>
            Input tokens
          </span>

          <span>
            {formatTokens(
              runA.input_tokens,
            )}
          </span>

          <span>
            {formatTokens(
              runB.input_tokens,
            )}
          </span>
        </div>


        <div className="run-comparison-row">
          <span>
            Output tokens
          </span>

          <span>
            {formatTokens(
              runA.output_tokens,
            )}
          </span>

          <span>
            {formatTokens(
              runB.output_tokens,
            )}
          </span>
        </div>


        <div className="run-comparison-row">
          <span>
            Total tokens
          </span>

          <span>
            {formatTokens(
              runA.total_tokens,
            )}
          </span>

          <span>
            {formatTokens(
              runB.total_tokens,
            )}
          </span>
        </div>


        <div className="run-comparison-row">
          <span>
            Runtime
          </span>

          <span>
            {formatDuration(
              runA.duration_ms,
            )}
          </span>

          <span>
            {formatDuration(
              runB.duration_ms,
            )}
          </span>
        </div>
      </div>


      <div className="run-history-output-comparison">
        <article>
          <div className="run-history-output-heading">
            <div>
              <span>
                Run A
              </span>

              <strong>
                {providerLabel(
                  runA.provider,
                )}
              </strong>

              <small>
                {runA.model}
              </small>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                void navigator.clipboard.writeText(
                  runA.output_text,
                );
              }}
            >
              Copy
            </button>
          </div>

          <div className="run-history-output-content">
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
            >
              {runA.output_text}
            </ReactMarkdown>
          </div>
        </article>


        <article>
          <div className="run-history-output-heading">
            <div>
              <span>
                Run B
              </span>

              <strong>
                {providerLabel(
                  runB.provider,
                )}
              </strong>

              <small>
                {runB.model}
              </small>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                void navigator.clipboard.writeText(
                  runB.output_text,
                );
              }}
            >
              Copy
            </button>
          </div>

          <div className="run-history-output-content">
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
            >
              {runB.output_text}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </section>
  );
}