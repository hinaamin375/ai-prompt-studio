import {
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import type {
  Prompt,
} from "../../../types/prompt";

import {
  useBulkPromptActions,
} from "../hooks/useBulkPromptActions";

import {
  useCollections,
} from "../hooks/useCollections";

import {
  usePromptSelection,
} from "../hooks/usePromptSelection";

import {
  BulkActionsBar,
} from "./BulkActionsBar";

import {
  PromptCard,
} from "./PromptCard";

import {
  PromptToolbar,
} from "./PromptToolbar";


type PromptSortOption =
  | "updated-desc"
  | "created-desc"
  | "created-asc"
  | "title-asc"
  | "title-desc";


interface PromptLibraryProps {
  prompts: Prompt[];
}


function normalizeText(
  value: string | null,
): string {
  return (
    value?.trim().toLowerCase() ?? ""
  );
}


function matchesSearch(
  prompt: Prompt,
  searchTerm: string,
): boolean {
  const normalizedSearch =
    normalizeText(searchTerm);

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

  return searchableText.includes(
    normalizedSearch,
  );
}


function sortPrompts(
  prompts: Prompt[],
  sortOption: PromptSortOption,
): Prompt[] {
  const sortedPrompts = [...prompts];

  sortedPrompts.sort(
    (left, right) => {
      switch (sortOption) {
        case "title-asc":
          return left.title.localeCompare(
            right.title,
          );

        case "title-desc":
          return right.title.localeCompare(
            left.title,
          );

        case "created-asc":
          return (
            new Date(
              left.created_at,
            ).getTime() -
            new Date(
              right.created_at,
            ).getTime()
          );

        case "created-desc":
          return (
            new Date(
              right.created_at,
            ).getTime() -
            new Date(
              left.created_at,
            ).getTime()
          );

        case "updated-desc":
        default:
          return (
            new Date(
              right.updated_at,
            ).getTime() -
            new Date(
              left.updated_at,
            ).getTime()
          );
      }
    },
  );

  return sortedPrompts;
}


export function PromptLibrary({
  prompts,
}: PromptLibraryProps) {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const [searchTerm, setSearchTerm] =
    useState("");

  const [sortOption, setSortOption] =
    useState<PromptSortOption>(
      "updated-desc",
    );

  const [
    favoritesOnly,
    setFavoritesOnly,
  ] = useState(false);


  const collectionFilter =
    searchParams.get("collection") ??
    "all";


  const {
    data: collections = [],
    isLoading: collectionsLoading,
  } = useCollections();


  const visiblePrompts = useMemo(() => {
    const filteredPrompts =
      prompts.filter((prompt) => {
        const matchesText =
          matchesSearch(
            prompt,
            searchTerm,
          );

        const matchesFavorite =
          !favoritesOnly ||
          prompt.favorite;


        let matchesCollection = true;

        if (
          collectionFilter === "none"
        ) {
          matchesCollection =
            prompt.collection_id === null;
        } else if (
          collectionFilter !== "all"
        ) {
          const collectionId =
            Number(collectionFilter);

          matchesCollection =
            Number.isFinite(
              collectionId,
            ) &&
            prompt.collection_id ===
              collectionId;
        }


        return (
          matchesText &&
          matchesFavorite &&
          matchesCollection
        );
      });


    return sortPrompts(
      filteredPrompts,
      sortOption,
    );
  }, [
    prompts,
    searchTerm,
    sortOption,
    favoritesOnly,
    collectionFilter,
  ]);


  const {
    selectedPromptIds,
    togglePromptSelection,
    selectAll,
    clearSelection,
  } = usePromptSelection({
    visiblePromptIds:
      visiblePrompts.map(
        (prompt) => prompt.id,
      ),
  });


  const {
    favoriteSelected,
    unfavoriteSelected,
    deleteSelected,
    isLoading,
  } = useBulkPromptActions({
    prompts,
    selectedPromptIds,
    clearSelection,
  });


  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    sortOption !== "updated-desc" ||
    favoritesOnly ||
    collectionFilter !== "all";


  function handleCollectionFilterChange(
    value: string,
  ): void {
    const nextParams =
      new URLSearchParams(
        searchParams,
      );

    if (value === "all") {
      nextParams.delete(
        "collection",
      );
    } else {
      nextParams.set(
        "collection",
        value,
      );
    }

    setSearchParams(
      nextParams,
      {
        replace: true,
      },
    );

    clearSelection();
  }


  function clearFilters(): void {
    setSearchTerm("");
    setSortOption("updated-desc");
    setFavoritesOnly(false);

    const nextParams =
      new URLSearchParams(
        searchParams,
      );

    nextParams.delete(
      "collection",
    );

    setSearchParams(
      nextParams,
      {
        replace: true,
      },
    );

    clearSelection();
  }


  function getCollectionName(
    collectionId: number | null,
  ): string | null {
    if (collectionId === null) {
      return null;
    }

    const collection =
      collections.find(
        (item) =>
          item.id === collectionId,
      );

    return (
      collection?.name ?? null
    );
  }


  return (
    <section className="prompt-library">
      <PromptToolbar
        searchTerm={searchTerm}
        sortOption={sortOption}
        favoritesOnly={favoritesOnly}
        collectionFilter={
          collectionFilter
        }
        collections={collections}
        collectionsLoading={
          collectionsLoading
        }
        hasActiveFilters={
          hasActiveFilters
        }
        onSearchChange={
          setSearchTerm
        }
        onSortChange={(value) =>
          setSortOption(
            value as PromptSortOption,
          )
        }
        onFavoritesOnlyChange={
          setFavoritesOnly
        }
        onCollectionFilterChange={
          handleCollectionFilterChange
        }
        onClearFilters={
          clearFilters
        }
      />


      {selectedPromptIds.length >
        0 && (
        <BulkActionsBar
          selected={
            selectedPromptIds.length
          }
          allSelected={
            visiblePrompts.length >
              0 &&
            selectedPromptIds.length ===
              visiblePrompts.length
          }
          isLoading={isLoading}
          onFavoriteSelected={
            favoriteSelected
          }
          onUnfavoriteSelected={
            unfavoriteSelected
          }
          onDeleteSelected={
            deleteSelected
          }
          onSelectAll={
            selectAll
          }
          onClearSelection={
            clearSelection
          }
        />
      )}


      <div className="prompt-library-summary">
        <p>
          Showing{" "}
          <strong>
            {visiblePrompts.length}
          </strong>{" "}
          of{" "}
          <strong>
            {prompts.length}
          </strong>{" "}
          {prompts.length === 1
            ? "prompt"
            : "prompts"}
        </p>
      </div>


      {visiblePrompts.length === 0 ? (
        <div className="card prompt-library-empty">
          <h3>
            No matching prompts
          </h3>

          <p>
            Try changing your search
            text or clearing the current
            filters.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={
              clearFilters
            }
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="prompt-grid">
          {visiblePrompts.map(
            (prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                collectionName={
                  getCollectionName(
                    prompt.collection_id,
                  )
                }
                selected={
                  selectedPromptIds.includes(
                    prompt.id,
                  )
                }
                onToggleSelection={
                  togglePromptSelection
                }
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}