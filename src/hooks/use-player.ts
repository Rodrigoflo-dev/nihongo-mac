import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

const PLAYER_KEY = ["player-state"] as const;
const DASH_KEY = ["dashboard-stats"];

export function usePlayer() {
  return useQuery({
    queryKey: PLAYER_KEY,
    queryFn: () => api.getPlayerState(),
    staleTime: 1000 * 10,
  });
}

export function useDailyMissions() {
  return useQuery({
    queryKey: ["missions", "daily"],
    queryFn: () => api.getDailyMissions(),
    staleTime: 1000 * 10,
  });
}

export function useWeeklyMissions() {
  return useQuery({
    queryKey: ["missions", "weekly"],
    queryFn: () => api.getWeeklyMissions(),
    staleTime: 1000 * 10,
  });
}

export function useInvalidateProgress() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: PLAYER_KEY });
    qc.invalidateQueries({ queryKey: ["missions"] });
    qc.invalidateQueries({ queryKey: DASH_KEY });
  };
}

export function useClaimRestDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.claimRestDay(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAYER_KEY });
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: DASH_KEY });
    },
  });
}

export function useActivateDoubleXp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.activateDoubleXp(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAYER_KEY });
      qc.invalidateQueries({ queryKey: DASH_KEY });
    },
  });
}
