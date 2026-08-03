import type { RenderedDocument } from "../types/analysis";

interface RenderedPromptProps {
  document?: RenderedDocument;
}

export function RenderedPrompt({
  document,
}: RenderedPromptProps) {
  return (
    <section className="analysis-card">
      <h3>Rendered Prompt</h3>

      {!document ? (
        <p>No rendered prompt yet.</p>
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