import { useState } from "react";

interface UsePromptSelectionOptions {
  visiblePromptIds: number[];
}

export function usePromptSelection({
  visiblePromptIds,
}: UsePromptSelectionOptions) {
  const [selectedPromptIds, setSelectedPromptIds] =
    useState<number[]>([]);

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
      visiblePromptIds.length
    ) {
      setSelectedPromptIds([]);
      return;
    }

    setSelectedPromptIds(
      visiblePromptIds,
    );
  }

  function clearSelection(): void {
    setSelectedPromptIds([]);
  }

  return {
    selectedPromptIds,
    setSelectedPromptIds,
    togglePromptSelection,
    selectAll,
    clearSelection,
  };
}