import { useQuery } from "@tanstack/react-query";

import { listPrompts } from "../../../api/prompts";

export function usePrompts() {
  return useQuery({
    queryKey: ["prompts"],
    queryFn: listPrompts,
  });
}