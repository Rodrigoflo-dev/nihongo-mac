import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type JlptLevel } from "@/lib/api";

export function useListeningList(level: JlptLevel) {
  return useQuery({
    queryKey: ["listening", "list", level],
    queryFn: () => api.listListening(level),
    staleTime: 1000 * 30,
  });
}

export function useListeningDialogue(dialogueId: number | undefined) {
  return useQuery({
    queryKey: ["listening", "dialogue", dialogueId],
    queryFn: () => api.getListeningDialogue(dialogueId!),
    enabled: dialogueId !== undefined,
    staleTime: 1000 * 60,
  });
}

export function usePlayTts() {
  return useMutation({
    mutationFn: ({
      text,
      voice,
      rate,
    }: {
      text: string;
      voice?: string;
      rate?: number;
    }) => api.playJapaneseTts(text, voice, rate),
  });
}

export function useCompleteListening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dialogueId,
      submission,
    }: {
      dialogueId: number;
      submission: {
        answers: { questionId: string; optionIndex: number }[];
        durationSeconds?: number;
      };
    }) => api.completeListeningDialogue(dialogueId, submission),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listening"] });
      qc.invalidateQueries({ queryKey: ["player-state"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["next-action"] });
    },
  });
}
