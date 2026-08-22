import {
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [
    copied,
    setCopied,
  ] = useState(false);


  async function handleCopy(): Promise<void> {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        result.output_text,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }


  return (
    <section className="model-comparison-result">
      <header className="model-comparison-result-header">
        <div>
          <p className="eyebrow">
            {title}
          </p>

          <h3>
            {result?.model ??
              "Waiting to run"}
          </h3>
        </div>

        {result && (
          <button
            type="button"
            className="secondary-button model-result-copy"
            onClick={handleCopy}
          >
            {copied
              ? "Copied!"
              : "Copy Response"}
          </button>
        )}
      </header>


      {!result ? (
        <div className="analysis-empty-state">
          Run the comparison to see this
          model&apos;s response.
        </div>
      ) : (
        <>
          <div className="model-comparison-output">
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
            >
              {result.output_text}
            </ReactMarkdown>
          </div>


          <div className="model-comparison-meta">
            <span>
              Provider: {result.provider}
            </span>

            <span>
              Input:{" "}
              {result.usage.input_tokens ??
                "—"}
            </span>

            <span>
              Output:{" "}
              {result.usage.output_tokens ??
                "—"}
            </span>

            <span>
              Total:{" "}
              {result.usage.total_tokens ??
                "—"}
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