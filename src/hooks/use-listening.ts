import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type JlptLevel } from "@/lib/api";
import { TtsError, cancelSpeech, speakJapanese } from "@/lib/tts";

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

/**
 * Cross-platform Japanese TTS via the WebView's Web Speech API (see lib/tts).
 *
 * - Keeps a local "isPlaying" state so the play button reflects real playback.
 * - Exposes `error` (a human message) so callers can warn when no Japanese
 *   voice is installed (common on a fresh Windows install).
 * - Cancels in-flight speech on unmount so navigating away stops audio.
 */
export function usePlayTts() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => cancelSpeech(), []);

  const mutation = useMutation({
    mutationFn: ({
      text,
      voice,
      rate,
    }: {
      text: string;
      voice?: string;
      rate?: number;
    }) => speakJapanese(text, { voice, rate }),
    onMutate: () => {
      setError(null);
      setIsPlaying(true);
    },
    onError: (err) => {
      setError(
        err instanceof TtsError
          ? err.message
          : "No se pudo reproducir el audio."
      );
    },
    onSettled: () => {
      setIsPlaying(false);
    },
  });

  const clearError = useCallback(() => setError(null), []);

  return {
    ...mutation,
    // Override isPending so the UI uses our managed local state
    isPending: isPlaying,
    ttsError: error,
    clearTtsError: clearError,
  };
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
