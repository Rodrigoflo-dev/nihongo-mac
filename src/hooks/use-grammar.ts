import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  api,
  type JlptLevel,
  type QuizSubmission,
} from "@/lib/api";

export function useGrammarList(level: JlptLevel) {
  return useQuery({
    queryKey: ["grammar", "list", level],
    queryFn: () => api.listGrammar(level),
    staleTime: 1000 * 30,
  });
}

export function useGrammarLesson(lessonId: number | undefined) {
  return useQuery({
    queryKey: ["grammar", "lesson", lessonId],
    queryFn: () => api.getGrammarLesson(lessonId!),
    enabled: lessonId !== undefined,
    staleTime: 1000 * 60,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["grammar"] });
  qc.invalidateQueries({ queryKey: ["player-state"] });
  qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  qc.invalidateQueries({ queryKey: ["next-action"] });
}

export function useStartGrammarLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: number) => api.startGrammarLesson(lessonId),
    onSuccess: () => invalidate(qc),
  });
}

export function useSubmitGrammarQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      submission,
    }: {
      lessonId: number;
      submission: QuizSubmission;
    }) => api.submitGrammarQuiz(lessonId, submission),
    onSuccess: () => invalidate(qc),
  });
}
