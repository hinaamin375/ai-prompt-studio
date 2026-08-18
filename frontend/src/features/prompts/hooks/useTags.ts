import { useQuery } from "@tanstack/react-query";

import { listTags } from "../../../api/tags";


export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: listTags,
  });
}