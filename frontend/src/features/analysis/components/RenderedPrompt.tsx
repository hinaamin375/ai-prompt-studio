import { useMemo } from "react";

import type { RenderedDocument } from "../types/analysis";

interface RenderedPromptProps {
  document?: RenderedDocument;
}

export function RenderedPrompt({
  document,
}: RenderedPromptProps) {
  const text = useMemo(() => {
    if (!document) {
      return "";
    }

    return document.messages
      .map(
        (message) =>
          `${message.role.toUpperCase()}\n\n${message.content}`,
      )
      .join("\n\n----------------------------\n\n");
  }, [document]);

  async function handleCopy() {
    if (!text) {
      return;
    }

    await navigator.clipboard.writeText(text);
  }

  return (
    <section className="analysis-card">
      <div className="analysis-card-header">
        <h3>Rendered Prompt</h3>

        <button
          type="button"
          className="secondary-button"
          onClick={handleCopy}
          disabled={!document}
        >
          📋 Copy
        </button>
      </div>

      {!document ? (
        <div className="analysis-empty-state">
          Click <strong>Analyze Prompt</strong> to
          generate a rendered prompt.
        </div>
      ) : (
        <div className="rendered-document">
          {document.messages.map((message, index) => (
            <div
              key={index}
              className="rendered-message"
            >
              <div className="rendered-role">
                {message.role.toUpperCase()}
              </div>

              <pre className="rendered-content">
                {message.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}