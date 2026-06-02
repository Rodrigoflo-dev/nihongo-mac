import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type JlptLevel, type QuizSubmission } from "@/lib/api";

export function useReadingList(level: JlptLevel) {
  return useQuery({
    queryKey: ["reading", "list", level],
    queryFn: () => api.listReading(level),
    staleTime: 1000 * 30,
  });
}

export function useReadingPassage(passageId: number | undefined) {
  return useQuery({
    queryKey: ["reading", "passage", passageId],
    queryFn: () => api.getReadingPassage(passageId!),
    enabled: passageId !== undefined,
    staleTime: 1000 * 60,
  });
}

export function useCompleteReading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      passageId,
      submission,
    }: {
      passageId: number;
      submission: QuizSubmission;
    }) => api.completeReadingPassage(passageId, submission),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reading"] });
      qc.invalidateQueries({ queryKey: ["player-state"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["next-action"] });
    },
  });
}
