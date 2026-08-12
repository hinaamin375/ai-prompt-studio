import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "../../../api/collections";

import type {
  CollectionCreate,
  CollectionUpdate,
} from "../../../types/collection";


interface UpdateCollectionVariables {
  collectionId: number;
  data: CollectionUpdate;
}


export function useCollectionMutations() {
  const queryClient = useQueryClient();


  const createMutation = useMutation({
    mutationFn: (
      data: CollectionCreate,
    ) => createCollection(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
    },
  });


  const updateMutation = useMutation({
    mutationFn: ({
      collectionId,
      data,
    }: UpdateCollectionVariables) =>
      updateCollection(
        collectionId,
        data,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["collections"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });
    },
  });


  const deleteMutation = useMutation({
    mutationFn: (
      collectionId: number,
    ) =>
      deleteCollection(collectionId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["collections"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });
    },
  });


  return {
    createCollection:
      createMutation.mutateAsync,

    updateCollection:
      updateMutation.mutateAsync,

    deleteCollection:
      deleteMutation.mutateAsync,

    isCreating:
      createMutation.isPending,

    isUpdating:
      updateMutation.isPending,

    isDeleting:
      deleteMutation.isPending,

    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}