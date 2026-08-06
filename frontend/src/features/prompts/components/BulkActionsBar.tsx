interface BulkActionsBarProps {
  selected: number;
  allSelected: boolean;
  isLoading: boolean;

  onFavoriteSelected(): void;
  onUnfavoriteSelected(): void;
  onDeleteSelected(): void;

  onSelectAll(): void;
  onClearSelection(): void;
}

export function BulkActionsBar({
  selected,
  allSelected,
  isLoading,
  onFavoriteSelected,
  onUnfavoriteSelected,
  onDeleteSelected,
  onSelectAll,
  onClearSelection,
}: BulkActionsBarProps) {
  return (
    <section className="bulk-actions-bar">
      <div className="bulk-actions-info">
        <strong>{selected}</strong>{" "}
        {selected === 1 ? "prompt" : "prompts"} selected
      </div>

      <div className="bulk-actions-buttons">
        <button
          type="button"
          className="secondary-button"
          disabled={isLoading}
          onClick={onFavoriteSelected}
        >
          ⭐ Favorite
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={isLoading}
          onClick={onUnfavoriteSelected}
        >
          ☆ Unfavorite
        </button>

        <button
          type="button"
          className="danger-button"
          disabled={isLoading}
          onClick={onDeleteSelected}
        >
          🗑 Delete
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={isLoading}
          onClick={onSelectAll}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={isLoading}
          onClick={onClearSelection}
        >
          Clear
        </button>
      </div>
    </section>
  );
}