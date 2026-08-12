import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPromptVersion,
  listPromptVersions,
  restorePromptVersion,
} from "../../../api/promptVersions";


export function usePromptVersions(
  promptId: number,
) {
  return useQuery({
    queryKey: [
      "prompts",
      promptId,
      "versions",
    ],
    queryFn: () =>
      listPromptVersions(promptId),
    enabled:
      Number.isInteger(promptId) &&
      promptId > 0,
  });
}


export function usePromptVersion(
  promptId: number,
  version: number | null,
) {
  return useQuery({
    queryKey: [
      "prompts",
      promptId,
      "versions",
      version,
    ],

    queryFn: () => {
      if (version === null) {
        throw new Error(
          "A prompt version is required.",
        );
      }

      return getPromptVersion(
        promptId,
        version,
      );
    },

    enabled:
      Number.isInteger(promptId) &&
      promptId > 0 &&
      version !== null &&
      Number.isInteger(version) &&
      version > 0,
  });
}


interface RestorePromptVersionVariables {
  version: number;
}


export function useRestorePromptVersion(
  promptId: number,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      version,
    }: RestorePromptVersionVariables) =>
      restorePromptVersion(
        promptId,
        version,
      ),

    onSuccess: async () => {
      /*
       * Restoring a version changes the current
       * prompt and also creates another history
       * snapshot on the backend.
       *
       * Refresh both current prompt data and
       * version-history data.
       */
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["prompts"],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "prompts",
            promptId,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "prompts",
            promptId,
            "versions",
          ],
        }),
      ]);
    },
  });
}