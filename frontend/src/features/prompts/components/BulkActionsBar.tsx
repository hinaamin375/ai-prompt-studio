interface BulkActionsBarProps {
  selected: number;
  allSelected: boolean;

  onSelectAll(): void;
  onClearSelection(): void;
}

export function BulkActionsBar({
  selected,
  allSelected,
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
          onClick={onSelectAll}
        >
          {allSelected
            ? "Deselect All"
            : "Select All"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={onClearSelection}
        >
          Clear
        </button>
      </div>
    </section>
  );
}