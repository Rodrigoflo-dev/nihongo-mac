import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type UpdateAiBackendInput } from "@/lib/api";

export function useAiBackend() {
  return useQuery({
    queryKey: ["ai-backend"],
    queryFn: () => api.getAiBackendConfig(),
    staleTime: 1000 * 30,
  });
}

export function useUpdateAiBackend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAiBackendInput) => api.updateAiBackend(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-backend"] });
      qc.invalidateQueries({ queryKey: ["claude-key-set"] });
    },
  });
}

export function useTestOllama() {
  return useMutation({
    mutationFn: () => api.testOllama(),
  });
}
