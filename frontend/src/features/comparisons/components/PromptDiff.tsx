import type { PromptAnalysis } from "../../analysis/types/analysis";

interface PromptDiffProps {
  left: PromptAnalysis;
  right: PromptAnalysis;
}

interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}

function createDiff(
  left: string,
  right: string,
): DiffLine[] {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");

  const max = Math.max(leftLines.length, rightLines.length);

  const result: DiffLine[] = [];

  for (let i = 0; i < max; i++) {
    const a = leftLines[i];
    const b = rightLines[i];

    if (a === b) {
      if (a) {
        result.push({
          type: "same",
          text: a,
        });
      }
      continue;
    }

    if (a) {
      result.push({
        type: "removed",
        text: a,
      });
    }

    if (b) {
      result.push({
        type: "added",
        text: b,
      });
    }
  }

  return result;
}

export function PromptDiff({
  left,
  right,
}: PromptDiffProps) {
  const leftPrompt =
    left.rendered_document.messages
      .map(message => message.content)
      .join("\n");

  const rightPrompt =
    right.rendered_document.messages
      .map(message => message.content)
      .join("\n");

  const diff = createDiff(leftPrompt, rightPrompt);

  return (
    <section className="analysis-card">
      <h3>Prompt Differences</h3>

      <div className="prompt-diff">
        {diff.map((line, index) => (
          <div
            key={index}
            className={`diff-line diff-${line.type}`}
          >
            {line.type === "added" && "+"}
            {line.type === "removed" && "-"}
            {line.type === "same" && " "}
            {" "}
            {line.text}
          </div>
        ))}
      </div>
    </section>
  );
}