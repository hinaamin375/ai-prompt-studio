import type {
  PromptRunResponse,
} from "../types/playground";


interface RunResultProps {
  result?: PromptRunResponse;
}


function formatDuration(
  durationMs: number,
): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(
    durationMs / 1000
  ).toFixed(2)} s`;
}


function formatTokenCount(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  return value.toLocaleString();
}


export function RunResult({
  result,
}: RunResultProps) {
  async function handleCopy(): Promise<void> {
    if (!result?.output_text) {
      return;
    }

    await navigator.clipboard.writeText(
      result.output_text,
    );
  }


  return (
    <section className="playground-result">
      <div className="playground-result-header">
        <div>
          <p className="eyebrow">
            Model Output
          </p>

          <h3>AI Response</h3>
        </div>

        <button
          type="button"
          className="secondary-button"
          disabled={!result}
          onClick={handleCopy}
        >
          Copy
        </button>
      </div>

      {!result ? (
        <div className="playground-empty-result">
          Run the prompt to see the model
          response here.
        </div>
      ) : (
        <>
          <div className="playground-output">
            {result.output_text}
          </div>

          <div className="playground-run-meta">
            <span>
              <strong>
                {result.provider}
              </strong>
            </span>

            <span>
              {result.model}
            </span>

            <span>
              {formatTokenCount(
                result.usage.input_tokens,
              )}{" "}
              input
            </span>

            <span>
              {formatTokenCount(
                result.usage.output_tokens,
              )}{" "}
              output
            </span>

            <span>
              {formatTokenCount(
                result.usage.total_tokens,
              )}{" "}
              total
            </span>

            <span>
              {formatDuration(
                result.duration_ms,
              )}
            </span>
          </div>
        </>
      )}
    </section>
  );
}