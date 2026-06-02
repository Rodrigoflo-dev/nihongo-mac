import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type LessonResult } from "@/lib/api";

export function useUnitExam(unitId: number | undefined) {
  return useQuery({
    queryKey: ["unit-exam", unitId],
    queryFn: () => api.getUnitExam(unitId!),
    enabled: unitId !== undefined,
    staleTime: 0,
  });
}

export function useCompleteUnitExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      unitId,
      result,
    }: {
      unitId: number;
      result: LessonResult;
    }) => api.completeUnitExam(unitId, result),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unit-exam"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["player-state"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["next-action"] });
    },
  });
}
