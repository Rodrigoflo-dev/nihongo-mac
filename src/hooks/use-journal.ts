import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useJournalEntries() {
  return useQuery({
    queryKey: ["journal", "entries"],
    queryFn: () => api.listJournal(50),
    staleTime: 1000 * 15,
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
