import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useJournalEntries() {
  return useQuery({
    queryKey: ["journal", "entries"],
    queryFn: () => api.listJournal(50),
    staleTime: 1000 * 15,
  });
}

export function useHasClaudeKey() {
  return useQuery({
    queryKey: ["claude-key-set"],
    queryFn: () => api.hasClaudeApiKey(),
    staleTime: 1000 * 60,
  });
}

export function useSetClaudeKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => api.setClaudeApiKey(key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["claude-key-set"] });
    },
  });
}

export function useClearClaudeKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.clearClaudeApiKey(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["claude-key-set"] });
    },
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (textJp: string) => api.createJournalEntry(textJp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.invalidateQueries({ queryKey: ["player-state"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["next-action"] });
    },
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: number) => api.deleteJournalEntry(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}
