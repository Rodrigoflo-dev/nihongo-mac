import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Robust microphone recorder shared by the Speaking page and the lesson
 * speaking activity.
 *
 * Fixes the earlier issues:
 * - Audio cut out / "Error" on playback: caused by recording with a timeslice
 *   (`recorder.start(250)`), which produced fragmented mp4 the <audio> element
 *   couldn't decode. We now record in a single blob (`recorder.start()`).
 * - Wrong container on WKWebView: we pick a mime type the browser actually
 *   supports (mp4/aac on macOS, webm elsewhere) instead of hardcoding webm.
 * - Meter flicker + flashing "no sound" warning: the level is smoothed and the
 *   `silent` flag only trips after ~1.5s of sustained silence.
 */

export interface VoiceRecorder {
  recording: boolean;
  /** Smoothed input level 0..1 for the meter. */
  level: number;
  /** True only after sustained silence while recording (stable, no flicker). */
  silent: boolean;
  recordedUrl: string | null;
  recordedDuration: number | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return "";
}

export function useVoiceRecorder(): VoiceRecorder {
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [silent, setSilent] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothRef = useRef(0);
  const lastSoundRef = useRef(0);
  const startedAtRef = useRef(0);
  const urlRef = useRef<string | null>(null);

  const cleanupMeter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      cleanupMeter();
      stopStream();
      try {
        recorderRef.current?.stop();
      } catch {
        /* ignore */
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [cleanupMeter, stopStream]);

  const reset = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setRecordedUrl(null);
    setRecordedDuration(null);
    setError(null);
    setLevel(0);
    setSilent(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setSilent(false);
    setRecordedDuration(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mime = pickMimeType();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mime || "audio/mp4";
        const blob = new Blob(chunksRef.current, { type });
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setRecordedUrl(url);
        setRecordedDuration((Date.now() - startedAtRef.current) / 1000);
        cleanupMeter();
        stopStream();
        setLevel(0);
      };

      // Volume meter (smoothed) + sustained-silence detection.
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      lastSoundRef.current = Date.now();
      smoothRef.current = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.min(1, Math.sqrt(sum / buf.length) * 3);
        // Exponential smoothing kills the flicker.
        smoothRef.current = smoothRef.current * 0.82 + rms * 0.18;
        const now = Date.now();
        if (rms > 0.04) lastSoundRef.current = now;
        setLevel(smoothRef.current);
        // Only flag silence after 1.5s of sustained quiet.
        setSilent(now - lastSoundRef.current > 1500);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      // No timeslice → a single, complete, playable blob on stop.
      recorder.start();
      startedAtRef.current = Date.now();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError(
          "El micrófono está bloqueado. Actívalo en Ajustes del sistema → Privacidad → Micrófono y reintenta."
        );
      } else if (e.name === "NotFoundError") {
        setError("No detecté un micrófono conectado.");
      } else {
        setError(`No pude acceder al micrófono: ${e.message ?? e.name}`);
      }
    }
  }, [cleanupMeter, stopStream]);

  const stop = useCallback(() => {
    try {
      recorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    setRecording(false);
  }, []);

  return {
    recording,
    level,
    silent,
    recordedUrl,
    recordedDuration,
    error,
    start,
    stop,
    reset,
  };
}
