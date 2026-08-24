import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  PromptTestCaseRunResponse,
} from "../types/testCase";


interface TestCaseRunResultProps {
  result: PromptTestCaseRunResponse;
}


function formatDuration(
  durationMs: number,
): string {
  return `${(
    durationMs / 1000
  ).toFixed(2)} s`;
}


export function TestCaseRunResult({
  result,
}: TestCaseRunResultProps) {
  return (
    <div
      className={
        result.passed
          ? "test-case-run-result passed"
          : "test-case-run-result failed"
      }
    >
      <div className="test-case-result-heading">
        <div>
          <span className="test-case-result-status">
            {result.passed
              ? "✓ Passed"
              : "✗ Failed"}
          </span>

          <strong>
            {result.passed_count}
            {" / "}
            {
              result.assertions.length
            }
            {" checks passed"}
          </strong>
        </div>

        <div className="test-case-run-meta">
          <span>
            {result.run.provider}
          </span>

          <span>
            {result.run.model}
          </span>

          <span>
            {
              result.run.usage
                .total_tokens ?? "—"
            }
            {" tokens"}
          </span>

          <span>
            {formatDuration(
              result.run.duration_ms,
            )}
          </span>
        </div>
      </div>


      {result.assertions.length > 0 && (
        <div className="test-case-assertions">
          {result.assertions.map(
            (assertion) => (
              <div
                key={assertion.expected}
                className={
                  assertion.passed
                    ? "test-assertion passed"
                    : "test-assertion failed"
                }
              >
                <span>
                  {assertion.passed
                    ? "✓"
                    : "✗"}
                </span>

                <code>
                  {assertion.expected}
                </code>
              </div>
            ),
          )}
        </div>
      )}


      <div className="test-case-output">
        <div className="test-case-output-heading">
          <h4>
            AI Response
          </h4>

          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              void navigator.clipboard.writeText(
                result.run.output_text,
              );
            }}
          >
            Copy
          </button>
        </div>

        <div className="test-case-output-content">
          <ReactMarkdown
            remarkPlugins={[
              remarkGfm,
            ]}
          >
            {result.run.output_text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}