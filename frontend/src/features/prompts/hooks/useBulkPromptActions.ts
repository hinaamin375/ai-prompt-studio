import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deletePrompt,
  setPromptFavorite,
} from "../../../api/prompts";
import type { Prompt } from "../../../types/prompt";

interface UseBulkPromptActionsOptions {
  prompts: Prompt[];
  selectedPromptIds: number[];
  clearSelection(): void;
}

export function useBulkPromptActions({
  prompts,
  selectedPromptIds,
  clearSelection,
}: UseBulkPromptActionsOptions) {
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async (favorite: boolean) => {
      const selected = prompts.filter((prompt) =>
        selectedPromptIds.includes(prompt.id),
      );

      await Promise.all(
        selected.map((prompt) =>
          setPromptFavorite(prompt.id, favorite),
        ),
      );
    },

    onSuccess: async (_, favorite) => {
      await queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });

      clearSelection();

      toast.success(
        favorite
          ? "Prompts added to favorites."
          : "Prompts removed from favorites.",
      );
    },

    onError: () => {
      toast.error(
        "Unable to update favorites.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        selectedPromptIds.map((id) =>
          deletePrompt(id),
        ),
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });

      clearSelection();

      toast.success(
        "Selected prompts deleted.",
      );
    },

    onError: () => {
      toast.error(
        "Unable to delete prompts.",
      );
    },
  });

  return {
    favoriteSelected: () =>
      favoriteMutation.mutate(true),

    unfavoriteSelected: () =>
      favoriteMutation.mutate(false),

    deleteSelected: () => {
      if (
        window.confirm(
          `Delete ${selectedPromptIds.length} selected prompt(s)?`,
        )
      ) {
        deleteMutation.mutate();
      }
    },

    isLoading:
      favoriteMutation.isPending ||
      deleteMutation.isPending,
  };
}