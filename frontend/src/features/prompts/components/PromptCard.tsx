import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  duplicatePrompt,
} from "../../../api/prompts";

import type {
  Prompt,
} from "../../../types/prompt";

import {
  FavoriteButton,
} from "./FavoriteButton";


interface PromptCardProps {
  prompt: Prompt;

  collectionName?: string | null;

  selected?: boolean;

  onToggleSelection?: (
    promptId: number,
  ) => void;
}


function formatDate(
  dateValue: string,
): string {
  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
    },
  ).format(
    new Date(dateValue),
  );
}


export function PromptCard({
  prompt,
  collectionName = null,
  selected = false,
  onToggleSelection,
}: PromptCardProps) {
  const navigate = useNavigate();

  const queryClient =
    useQueryClient();


  const duplicateMutation =
    useMutation({
      mutationFn: () =>
        duplicatePrompt(prompt.id),

      onSuccess: async (
        duplicatedPrompt,
      ) => {
        await queryClient.invalidateQueries({
          queryKey: ["prompts"],
        });

        navigate(
          `/prompts/${duplicatedPrompt.id}/edit`,
        );
      },

      onError: () => {
        window.alert(
          "Unable to duplicate this prompt. Please try again.",
        );
      },
    });


  function handleDuplicate(): void {
    duplicateMutation.mutate();
  }


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
              aria-label={
                `Select ${prompt.title}`
              }
              checked={selected}
              onChange={() =>
                onToggleSelection(
                  prompt.id,
                )
              }
            />
          </div>
        )}


        <div className="prompt-card-heading">
          <h3>
            {prompt.title}
          </h3>

          <div className="prompt-card-actions">
            <FavoriteButton
              promptId={prompt.id}
              favorite={
                prompt.favorite
              }
            />

            <span className="prompt-id-badge">
              #{prompt.id}
            </span>
          </div>
        </div>


        {collectionName && (
          <div className="prompt-card-collection">
            <span aria-hidden="true">
              📁
            </span>

            <span>
              {collectionName}
            </span>
          </div>
        )}


        {prompt.tags.length > 0 && (
          <div
            className="prompt-card-tags"
            aria-label="Prompt tags"
          >
            {prompt.tags.map((tag) => (
              <span
                key={tag.id}
                className="prompt-card-tag"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}


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
          Updated{" "}
          {formatDate(
            prompt.updated_at,
          )}
        </span>

        <div className="prompt-card-footer-actions">
          <Link
  to={`/prompts/${prompt.id}/playground`}
  className="prompt-card-run"
>
  Run
</Link>
          <button
            type="button"
            className="prompt-card-duplicate"
            disabled={
              duplicateMutation.isPending
            }
            onClick={
              handleDuplicate
            }
          >
            {duplicateMutation.isPending
              ? "Duplicating..."
              : "Duplicate"}
          </button>

          <Link
            to={`/prompts/${prompt.id}/edit`}
          >
            Open prompt
          </Link>
        </div>
      </footer>
    </article>
  );
}