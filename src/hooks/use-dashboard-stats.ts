import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats(),
    staleTime: 1000 * 30,
  });
}
