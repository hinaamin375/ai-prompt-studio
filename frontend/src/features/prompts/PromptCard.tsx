import { Link } from "react-router-dom";

import type { Prompt } from "../../types/prompt";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({
  prompt,
}: PromptCardProps) {
  return (
    <article className="prompt-card">
      <div>
        <h3>{prompt.title}</h3>

        <p>
          {prompt.description ||
            "No description provided."}
        </p>
      </div>

      <div className="prompt-card-footer">
        <span>
          Updated{" "}
          {new Date(
            prompt.updated_at,
          ).toLocaleDateString()}
        </span>

        <Link to={`/prompts/${prompt.id}/edit`}>
          Open
        </Link>
      </div>
    </article>
  );
}