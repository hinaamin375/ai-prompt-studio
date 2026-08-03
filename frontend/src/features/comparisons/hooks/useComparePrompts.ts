import { useMutation } from "@tanstack/react-query";

import { comparePrompts } from "../api/comparisons";

export function useComparePrompts() {
  return useMutation({
    mutationFn: comparePrompts,
  });
}