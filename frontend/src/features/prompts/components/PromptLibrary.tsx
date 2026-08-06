import {
  useMemo,
  useState,
} from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deletePrompt,
  setPromptFavorite,
} from "../../../api/prompts";
import type {
  Prompt,
} from "../../../types/prompt";

import { BulkActionsBar } from "./BulkActionsBar";
import { PromptCard } from "./PromptCard";

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

export function PromptLibrary({
  prompts,
}: PromptLibraryProps) {
    const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [sortOption, setSortOption] =
    useState<PromptSortOption>("updated-desc");

const [selectedPromptIds, setSelectedPromptIds] =
  useState<number[]>([]);

  const [favoritesOnly, setFavoritesOnly] =
  useState(false);
  

const [bulkLoading, setBulkLoading] =
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
  function togglePromptSelection(
  promptId: number,
): void {
  setSelectedPromptIds((current) =>
    current.includes(promptId)
      ? current.filter(
          (id) => id !== promptId,
        )
      : [...current, promptId],
  );
}

function selectAll(): void {
  if (
    selectedPromptIds.length ===
    visiblePrompts.length
  ) {
    setSelectedPromptIds([]);
    return;
  }

  setSelectedPromptIds(
    visiblePrompts.map(
      (prompt) => prompt.id,
    ),
  );
}

function clearSelection(): void {
  setSelectedPromptIds([]);
}
async function refreshPrompts(): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: ["prompts"],
  });
}

async function favoriteSelected(): Promise<void> {
  if (selectedPromptIds.length === 0) {
    return;
  }

  setBulkLoading(true);

  try {
    const promptsToUpdate = prompts.filter(
      (prompt) =>
        selectedPromptIds.includes(prompt.id) &&
        !prompt.favorite,
    );

    await Promise.all(
      promptsToUpdate.map((prompt) =>
        setPromptFavorite(
          prompt.id,
          true,
        ),
      ),
    );

    await refreshPrompts();

    setSelectedPromptIds([]);

    toast.success(
      promptsToUpdate.length === 0
        ? "Selected prompts are already favorites"
        : "Selected prompts added to favorites",
    );
  } catch {
    toast.error(
      "Could not favorite selected prompts",
      {
        description:
          "Please try again.",
      },
    );
  } finally {
    setBulkLoading(false);
  }
}

async function unfavoriteSelected(): Promise<void> {
  if (selectedPromptIds.length === 0) {
    return;
  }

  setBulkLoading(true);

  try {
    const promptsToUpdate = prompts.filter(
      (prompt) =>
        selectedPromptIds.includes(prompt.id) &&
        prompt.favorite,
    );

    await Promise.all(
      promptsToUpdate.map((prompt) =>
        setPromptFavorite(
          prompt.id,
          false,
        ),
      ),
    );

    await refreshPrompts();

    setSelectedPromptIds([]);

    toast.success(
      promptsToUpdate.length === 0
        ? "Selected prompts are not favorites"
        : "Selected prompts removed from favorites",
    );
  } catch {
    toast.error(
      "Could not unfavorite selected prompts",
      {
        description:
          "Please try again.",
      },
    );
  } finally {
    setBulkLoading(false);
  }
}

async function deleteSelected(): Promise<void> {
  if (selectedPromptIds.length === 0) {
    return;
  }

  const promptLabel =
    selectedPromptIds.length === 1
      ? "prompt"
      : "prompts";

  const confirmed = window.confirm(
    `Delete ${selectedPromptIds.length} ${promptLabel} permanently?`,
  );

  if (!confirmed) {
    toast.info("Bulk deletion cancelled");
    return;
  }

  setBulkLoading(true);

  try {
    await Promise.all(
      selectedPromptIds.map(
        (promptId) =>
          deletePrompt(promptId),
      ),
    );

    await refreshPrompts();

    setSelectedPromptIds([]);

    toast.success(
      `${selectedPromptIds.length} ${promptLabel} deleted`,
    );
  } catch {
    toast.error(
      "Could not delete selected prompts",
      {
        description:
          "Some prompts may not have been deleted. Refresh and try again.",
      },
    );
  } finally {
    setBulkLoading(false);
  }
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
      {selectedPromptIds.length > 0 && (
 <BulkActionsBar
  selected={selectedPromptIds.length}
  allSelected={
    selectedPromptIds.length ===
    visiblePrompts.length
  }
  isLoading={bulkLoading}
  onFavoriteSelected={favoriteSelected}
  onUnfavoriteSelected={unfavoriteSelected}
  onDeleteSelected={deleteSelected}
  onSelectAll={selectAll}
  onClearSelection={clearSelection}
/>
)}

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
  <PromptCard
    key={prompt.id}
    prompt={prompt}
    selected={selectedPromptIds.includes(
      prompt.id,
    )}
    onToggleSelection={
      togglePromptSelection
    }
  />
))}
        </div>
      )}
    </section>
  );
}