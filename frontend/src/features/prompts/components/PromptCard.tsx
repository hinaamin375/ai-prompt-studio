import { Link } from "react-router-dom";

import type { Prompt } from "../../../types/prompt";

import { FavoriteButton } from "./FavoriteButton";

interface PromptCardProps {
  prompt: Prompt;
  selected?: boolean;
  onToggleSelection?: (
    promptId: number,
  ) => void;
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(dateValue));
}

export function PromptCard({
  prompt,
  selected = false,
  onToggleSelection,
}: PromptCardProps) {
  return (
    <article
      className={
        selected
          ? "prompt-card selected"
          : "prompt-card"
      }
    >
      <div>
        {onToggleSelection && (
          <div className="prompt-selection">
            <input
              type="checkbox"
              aria-label={`Select ${prompt.title}`}
              checked={selected}
              onChange={() =>
                onToggleSelection(prompt.id)
              }
            />
          </div>
        )}

        <div className="prompt-card-heading">
          <h3>{prompt.title}</h3>

          <div className="prompt-card-actions">
            <FavoriteButton
              promptId={prompt.id}
              favorite={prompt.favorite}
            />

            <span className="prompt-id-badge">
              #{prompt.id}
            </span>
          </div>
        </div>

        <p>
          {prompt.description?.trim() ||
            "No description provided."}
        </p>

        <div className="prompt-card-preview">
          {prompt.user_prompt}
        </div>
      </div>

      <footer className="prompt-card-footer">
        <span>
          Updated {formatDate(prompt.updated_at)}
        </span>

        <Link
          to={`/prompts/${prompt.id}/edit`}
        >
          Open prompt
        </Link>
      </footer>
    </article>
  );
}