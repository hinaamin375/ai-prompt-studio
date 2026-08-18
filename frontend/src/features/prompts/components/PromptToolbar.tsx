import type { Collection } from "../../../types/collection";
import type { Tag } from "../../../types/tag";


interface PromptToolbarProps {
  searchTerm: string;
  sortOption: string;
  favoritesOnly: boolean;

  collectionFilter: string;
  collections: Collection[];
  collectionsLoading: boolean;

  tagFilter: string;
  tags: Tag[];
  tagsLoading: boolean;

  hasActiveFilters: boolean;

  onSearchChange(value: string): void;
  onSortChange(value: string): void;

  onFavoritesOnlyChange(
    value: boolean,
  ): void;

  onCollectionFilterChange(
    value: string,
  ): void;

  onTagFilterChange(
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
  tagFilter,
  tags,
  tagsLoading,
  hasActiveFilters,
  onSearchChange,
  onSortChange,
  onFavoritesOnlyChange,
  onCollectionFilterChange,
  onTagFilterChange,
  onClearFilters,
}: PromptToolbarProps) {
  return (
  <div className="library-filterbar">
    <div className="library-filterbar__search">
      <label htmlFor="prompt-search">
        Search prompts
      </label>

      <input
        id="prompt-search"
        type="search"
        value={searchTerm}
        placeholder="Search by title, description, or prompt text..."
        onChange={(event) =>
          onSearchChange(event.target.value)
        }
      />
    </div>

    <div className="library-filterbar__field">
      <label htmlFor="prompt-sort">
        Sort by
      </label>

      <select
        id="prompt-sort"
        value={sortOption}
        onChange={(event) =>
          onSortChange(event.target.value)
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

    <div className="library-filterbar__field">
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

        {collections.map((collection) => (
          <option
            key={collection.id}
            value={String(collection.id)}
          >
            {collection.name}
          </option>
        ))}
      </select>
    </div>

    <div className="library-filterbar__field">
      <label htmlFor="prompt-tag-filter">
        Tag
      </label>

      <select
        id="prompt-tag-filter"
        value={tagFilter}
        disabled={tagsLoading}
        onChange={(event) =>
          onTagFilterChange(event.target.value)
        }
      >
        <option value="all">
          All tags
        </option>

        <option value="none">
          No tags
        </option>

        {tags.map((tag) => (
          <option
            key={tag.id}
            value={String(tag.id)}
          >
            {tag.name}
          </option>
        ))}
      </select>
    </div>

    <div className="library-filterbar__favorite">
      <span className="library-filterbar__spacer">
        &nbsp;
      </span>

      <label className="library-filterbar__favorite-control">
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
    </div>

    {hasActiveFilters && (
      <div className="library-filterbar__clear">
        <span className="library-filterbar__spacer">
          &nbsp;
        </span>

        <button
          type="button"
          onClick={onClearFilters}
        >
          Clear
        </button>
      </div>
    )}
  </div>
);}