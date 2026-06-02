import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useNextAction() {
  return useQuery({
    queryKey: ["next-action"],
    queryFn: () => api.getNextAction(),
    staleTime: 1000 * 15,
  });
}
