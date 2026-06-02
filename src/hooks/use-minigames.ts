import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useMinigameBest(gameKey: string) {
  return useQuery({
    queryKey: ["minigame", "best", gameKey],
    queryFn: () => api.getMinigameBest(gameKey),
    staleTime: 1000 * 10,
  });
}

export function useRecordMinigameScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      gameKey,
      score,
      durationSeconds,
    }: {
      gameKey: string;
      score: number;
      durationSeconds?: number;
    }) => api.recordMinigameScore(gameKey, score, durationSeconds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["minigame"] });
      qc.invalidateQueries({ queryKey: ["player-state"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
