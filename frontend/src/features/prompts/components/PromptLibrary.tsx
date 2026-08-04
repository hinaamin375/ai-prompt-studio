import {
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import {
  FavoriteButton,
} from "./FavoriteButton";

import type { Prompt } from "../../../types/prompt";

type PromptSortOption =
  | "updated-desc"
  | "created-desc"
  | "created-asc"
  | "title-asc"
  | "title-desc";

interface PromptLibraryProps {
  prompts: Prompt[];
}

function normalizeText(value: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

function matchesSearch(
  prompt: Prompt,
  searchTerm: string,
): boolean {
  const normalizedSearch = normalizeText(searchTerm);

  if (!normalizedSearch) {
    return true;
  }

  const searchableText = [
    prompt.title,
    prompt.description,
    prompt.system_prompt,
    prompt.user_prompt,
  ]
    .map(normalizeText)
    .join(" ");

  return searchableText.includes(normalizedSearch);
}

function sortPrompts(
  prompts: Prompt[],
  sortOption: PromptSortOption,
): Prompt[] {
  const sortedPrompts = [...prompts];

  sortedPrompts.sort((left, right) => {
    switch (sortOption) {
      case "title-asc":
        return left.title.localeCompare(right.title);

      case "title-desc":
        return right.title.localeCompare(left.title);

      case "created-asc":
        return (
          new Date(left.created_at).getTime() -
          new Date(right.created_at).getTime()
        );

      case "created-desc":
        return (
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime()
        );

      case "updated-desc":
      default:
        return (
          new Date(right.updated_at).getTime() -
          new Date(left.updated_at).getTime()
        );
    }
  });

  return sortedPrompts;
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(dateValue));
}

export function PromptLibrary({
  prompts,
}: PromptLibraryProps) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [sortOption, setSortOption] =
    useState<PromptSortOption>("updated-desc");

  const [favoritesOnly, setFavoritesOnly] =
  useState(false);

  const visiblePrompts = useMemo(() => {
    const filteredPrompts = prompts.filter(
  (prompt) => {
    const matchesText = matchesSearch(
      prompt,
      searchTerm,
    );

    const matchesFavorite =
      !favoritesOnly ||
      prompt.favorite;

    return (
      matchesText &&
      matchesFavorite
    );
  },
);

    return sortPrompts(
      filteredPrompts,
      sortOption,
    );
  }, [
    prompts,
    searchTerm,
    sortOption,
    favoritesOnly,
  ]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    sortOption !== "updated-desc" ||
    favoritesOnly;

  function clearFilters(): void {
    setSearchTerm("");
    setSortOption("updated-desc");
    setFavoritesOnly(false);
  }

  return (
    <section className="prompt-library">
      <div className="prompt-library-toolbar">
        <div className="prompt-search-field">
          <label htmlFor="prompt-search">
            Search prompts
          </label>

          <input
            id="prompt-search"
            type="search"
            value={searchTerm}
            placeholder="Search by title, description, or prompt text..."
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="prompt-sort-field">
          <label htmlFor="prompt-sort">
            Sort by
          </label>

          <select
            id="prompt-sort"
            value={sortOption}
            onChange={(event) =>
              setSortOption(
                event.target.value as PromptSortOption,
              )
            }
          >
            <option value="updated-desc">
              Recently updated
            </option>

            <option value="created-desc">
              Newest first
            </option>

            <option value="created-asc">
              Oldest first
            </option>

            <option value="title-asc">
              Title A–Z
            </option>

            <option value="title-desc">
              Title Z–A
            </option>
          </select>
        </div>

        <label className="favorites-filter">
            <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(event) =>
                setFavoritesOnly(
                    event.target.checked,
                )
                }
            />

            <span>Favorites only</span>
            </label>

        {hasActiveFilters && (
          <button
            type="button"
            className="secondary-button prompt-clear-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="prompt-library-summary">
        <p>
          Showing{" "}
          <strong>{visiblePrompts.length}</strong>{" "}
          of <strong>{prompts.length}</strong>{" "}
          {prompts.length === 1
            ? "prompt"
            : "prompts"}
        </p>
      </div>

      {visiblePrompts.length === 0 ? (
        <div className="card prompt-library-empty">
          <h3>No matching prompts</h3>

          <p>
            Try changing your search text or
            clearing the current filters.
          </p>
          

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="prompt-grid">
          {visiblePrompts.map((prompt) => (
            <article
              key={prompt.id}
              className="prompt-card"
            >
              <div>
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
                  Updated{" "}
                  {formatDate(prompt.updated_at)}
                </span>

                <Link
                  to={`/prompts/${prompt.id}/edit`}
                >
                  Open prompt
                </Link>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}