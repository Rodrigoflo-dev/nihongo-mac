import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type LessonResult } from "@/lib/api";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => api.listCourses(),
    staleTime: 1000 * 30,
  });
}

export function useNextLesson() {
  return useQuery({
    queryKey: ["next-lesson"],
    queryFn: () => api.getNextLesson(),
    staleTime: 1000 * 10,
  });
}

export function useLesson(lessonId: number | undefined) {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => api.getLesson(lessonId!),
    enabled: lessonId !== undefined,
    staleTime: 1000 * 60,
  });
}

function invalidateAfter(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["courses"] });
  qc.invalidateQueries({ queryKey: ["next-lesson"] });
  qc.invalidateQueries({ queryKey: ["lesson"] });
  qc.invalidateQueries({ queryKey: ["player-state"] });
  qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  qc.invalidateQueries({ queryKey: ["next-action"] });
  qc.invalidateQueries({ queryKey: ["missions"] });
}

export function useStartLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: number) => api.startLesson(lessonId),
    onSuccess: () => invalidateAfter(qc),
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (result: LessonResult) => api.completeLesson(result),
    onSuccess: () => invalidateAfter(qc),
  });
}
