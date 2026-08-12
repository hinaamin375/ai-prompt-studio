import { useQuery } from "@tanstack/react-query";

import { listCollections } from "../../../api/collections";


export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: listCollections,
  });
}