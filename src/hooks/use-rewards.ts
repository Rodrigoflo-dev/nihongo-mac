import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: () => api.listRewards(),
    staleTime: 1000 * 60,
  });
}

export function usePurchaseReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: number) => api.purchaseReward(rewardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rewards"] });
      qc.invalidateQueries({ queryKey: ["player-state"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
