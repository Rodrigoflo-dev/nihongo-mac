import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api, type JlptLevel, type ReviewGrade } from "@/lib/api";

export function useKanjiList(level: JlptLevel) {
  return useQuery({
    queryKey: ["kanji", "list", level],
    queryFn: () => api.listKanji(level),
    staleTime: 1000 * 30,
  });
}

export function useReviewQueue(level: JlptLevel) {
  return useQuery({
    queryKey: ["kanji", "queue", level],
    queryFn: () => api.getReviewQueue(level),
    staleTime: 0,
  });
}

function invalidateAfterReview(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["kanji"] });
  qc.invalidateQueries({ queryKey: ["player-state"] });
  qc.invalidateQueries({ queryKey: ["missions"] });
  qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

export function useIntroduceKanji() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kanjiId: number) => api.introduceKanji(kanjiId),
    onSuccess: () => invalidateAfterReview(qc),
  });
}

export function useReviewKanji() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      kanjiId,
      grade,
      durationSeconds,
    }: {
      kanjiId: number;
      grade: ReviewGrade;
      durationSeconds?: number;
    }) => api.reviewKanji(kanjiId, grade, durationSeconds),
    onSuccess: () => invalidateAfterReview(qc),
  });
}
