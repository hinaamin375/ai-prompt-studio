import type {
  PromptRunResponse,
} from "../../playground/types/playground";


interface ModelComparisonResultProps {
  title: string;
  result?: PromptRunResponse;
}


function formatDuration(
  durationMs: number,
): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(2)} s`;
}


export function ModelComparisonResult({
  title,
  result,
}: ModelComparisonResultProps) {
  return (
    <section className="model-comparison-result">
      <header>
        <p className="eyebrow">
          {title}
        </p>

        <h3>
          {result?.model ?? "Waiting to run"}
        </h3>
      </header>

      {!result ? (
        <div className="analysis-empty-state">
          Run the comparison to see this
          model&apos;s response.
        </div>
      ) : (
        <>
          <div className="model-comparison-output">
            {result.output_text}
          </div>

          <div className="model-comparison-meta">
            <span>
              Provider: {result.provider}
            </span>

            <span>
              Input:{" "}
              {result.usage.input_tokens ?? "—"}
            </span>

            <span>
              Output:{" "}
              {result.usage.output_tokens ?? "—"}
            </span>

            <span>
              Total:{" "}
              {result.usage.total_tokens ?? "—"}
            </span>

            <span>
              Time:{" "}
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