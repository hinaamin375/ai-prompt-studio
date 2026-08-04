import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  setPromptFavorite,
} from "../../../api/prompts";

interface FavoriteButtonProps {
  promptId: number;
  favorite: boolean;
}

export function FavoriteButton({
  promptId,
  favorite,
}: FavoriteButtonProps) {
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: () =>
      setPromptFavorite(
        promptId,
        !favorite,
      ),

    onSuccess: async (updatedPrompt) => {
      await queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "prompts",
          promptId,
        ],
      });

      if (updatedPrompt.favorite) {
        toast.success(
          "Prompt added to favorites",
        );
      } else {
        toast.success(
          "Prompt removed from favorites",
        );
      }
    },

    onError: () => {
      toast.error(
        "Could not update favorite",
        {
          description:
            "Please try again.",
        },
      );
    },
  });

  return (
    <button
      type="button"
      className={
        favorite
          ? "favorite-button active"
          : "favorite-button"
      }
      aria-label={
        favorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      title={
        favorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      disabled={favoriteMutation.isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        favoriteMutation.mutate();
      }}
    >
      {favorite ? "★" : "☆"}
    </button>
  );
}