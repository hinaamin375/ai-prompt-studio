import type { Collection } from "../../../types/collection";


interface PromptToolbarProps {
  searchTerm: string;
  sortOption: string;
  favoritesOnly: boolean;

  collectionFilter: string;
  collections: Collection[];
  collectionsLoading: boolean;

  hasActiveFilters: boolean;

  onSearchChange(value: string): void;
  onSortChange(value: string): void;

  onFavoritesOnlyChange(
    value: boolean,
  ): void;

  onCollectionFilterChange(
    value: string,
  ): void;

  onClearFilters(): void;
}


export function PromptToolbar({
  searchTerm,
  sortOption,
  favoritesOnly,
  collectionFilter,
  collections,
  collectionsLoading,
  hasActiveFilters,
  onSearchChange,
  onSortChange,
  onFavoritesOnlyChange,
  onCollectionFilterChange,
  onClearFilters,
}: PromptToolbarProps) {
  return (
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
            onSearchChange(
              event.target.value,
            )
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
            onSortChange(
              event.target.value,
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


      <div className="prompt-collection-field">
        <label htmlFor="prompt-collection-filter">
          Collection
        </label>

        <select
          id="prompt-collection-filter"
          value={collectionFilter}
          disabled={collectionsLoading}
          onChange={(event) =>
            onCollectionFilterChange(
              event.target.value,
            )
          }
        >
          <option value="all">
            All collections
          </option>

          <option value="none">
            No collection
          </option>

          {collections.map(
            (collection) => (
              <option
                key={collection.id}
                value={String(
                  collection.id,
                )}
              >
                {collection.name}
              </option>
            ),
          )}
        </select>
      </div>


      <label className="favorites-filter">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(event) =>
            onFavoritesOnlyChange(
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
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}