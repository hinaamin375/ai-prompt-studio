import { useMutation } from "@tanstack/react-query";

import { comparePrompts } from "../api/comparison";

export function useComparePrompts() {
  return useMutation({
    mutationFn: comparePrompts,
  });
}