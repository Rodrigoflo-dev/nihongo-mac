/**
 * Cross-platform Japanese text-to-speech using the WebView's built-in
 * Web Speech API (`window.speechSynthesis`).
 *
 * This replaces the old native approach that shelled out to the macOS `say`
 * command — which did not exist on Windows (no audio + a stray `cmd` console
 * window would pop up). `speechSynthesis` runs entirely inside the WebView, so
 * it works the same on macOS (WKWebView → Kyoko/Otoya) and Windows
 * (WebView2 → Haruka/Nanami/Ichiro) with no spawned process.
 *
 * Caveat: on Windows the Japanese voice may not be installed by default. In
 * that case we throw `TtsError("no-voice")` so the UI can tell the user how to
 * add it (Settings → Time & Language → Language → Japanese → Speech).
 */

export type TtsErrorCode = "unsupported" | "no-voice" | "speak-failed";

export class TtsError extends Error {
  code: TtsErrorCode;
  constructor(code: TtsErrorCode, message: string) {
    super(message);
    this.name = "TtsError";
    this.code = code;
  }
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Voices load asynchronously in most WebViews — `getVoices()` is often empty on
 * first call until the `voiceschanged` event fires. Resolve once we have them.
 */
function loadVoices(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!ttsSupported()) return resolve([]);
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) return resolve(existing);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(window.speechSynthesis.getVoices());
    };
    const onChange = () => finish();
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    // Fallback in case the event never fires.
    setTimeout(finish, timeoutMs);
  });
}

function isJapanese(v: SpeechSynthesisVoice): boolean {
  return /^ja(\b|[-_])/i.test(v.lang) || /japanese|日本/i.test(v.name);
}

/**
 * Find a Japanese voice. Prefer one whose name matches `preferred` (e.g.
 * "Kyoko"/"Otoya" on macOS); otherwise fall back to the first Japanese voice.
 */
export async function getJapaneseVoice(
  preferred?: string
): Promise<SpeechSynthesisVoice | null> {
  const voices = (await loadVoices()).filter(isJapanese);
  if (voices.length === 0) return null;
  if (preferred) {
    const match = voices.find((v) =>
      v.name.toLowerCase().includes(preferred.toLowerCase())
    );
    if (match) return match;
  }
  return voices[0];
}

export async function hasJapaneseVoice(): Promise<boolean> {
  return (await getJapaneseVoice()) !== null;
}

/** Language of the spoken narration (explanations, not Japanese). */
export type NarrationLang = "es" | "en";

const LANG_CODE: Record<NarrationLang, string> = {
  es: "es-ES",
  en: "en-US",
};

/** Find a voice for a narration language (Spanish/English). */
export async function getVoiceForLang(
  lang: NarrationLang
): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadVoices();
  const matches = voices.filter((v) =>
    new RegExp(`^${lang}(\\b|[-_])`, "i").test(v.lang)
  );
  if (matches.length === 0) return null;
  // Prefer a local/default voice for snappier playback.
  return matches.find((v) => v.localService) ?? matches[0];
}

/**
 * Narrate plain text (a Spanish or English explanation) aloud. Unlike
 * `speakJapanese`, this reads the lesson's EXPLANATION so learners who don't
 * like reading can listen instead. Falls back to the WebView default voice if no
 * exact language voice is installed (es/en ship on virtually every system).
 */
export async function speakText(
  text: string,
  lang: NarrationLang = "es",
  rate = 1
): Promise<void> {
  if (!ttsSupported()) {
    throw new TtsError("unsupported", "Tu sistema no soporta síntesis de voz.");
  }
  const voice = await getVoiceForLang(lang);
  stopSynth();

  return new Promise<void>((resolve, reject) => {
    const utter = new SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang || LANG_CODE[lang];
    utter.rate = Math.min(1.4, Math.max(0.6, rate));
    utter.pitch = 1;

    const cleanup = () => {
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = null;
      }
    };
    utter.onend = () => {
      cleanup();
      resolve();
    };
    utter.onerror = (e) => {
      cleanup();
      if (e.error === "canceled" || e.error === "interrupted") {
        resolve();
      } else {
        reject(new TtsError("speak-failed", `Falló la reproducción: ${e.error}`));
      }
    };

    const capMs = Math.min(60_000, 4_000 + text.length * 90);
    watchdog = setTimeout(() => {
      cleanup();
      resolve();
    }, capMs);

    window.speechSynthesis.speak(utter);
  });
}

/** Map words-per-minute (legacy API) to a Web Speech rate multiplier (1 = normal). */
function wpmToRate(wpm?: number): number {
  if (!wpm) return 0.95;
  const r = wpm / 170;
  return Math.min(1.6, Math.max(0.5, r));
}

export interface SpeakOptions {
  /** Preferred voice name, e.g. "Kyoko". Falls back to any Japanese voice. */
  voice?: string;
  /** Legacy words-per-minute value; mapped to a Web Speech rate multiplier. */
  rate?: number;
}

let watchdog: ReturnType<typeof setTimeout> | null = null;
/** Bumped whenever speech is cancelled so a running sequence knows to stop. */
let sequenceToken = 0;

/** Stop the synth engine without touching the sequence token (internal use). */
function stopSynth() {
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/** Stop any in-progress speech immediately (also aborts a running sequence). */
export function cancelSpeech() {
  sequenceToken++;
  stopSynth();
}

/** One chunk of a narration: Japanese (real pronunciation) or an explanation. */
export interface NarrationSegment {
  text: string;
  lang: "ja" | NarrationLang;
}

/**
 * Narrate a sequence of segments in order, switching voices per segment: the
 * Japanese parts are read with a Japanese voice (correct pronunciation) and the
 * explanation parts with the chosen es/en voice. `rate` is a multiplier
 * (0.75 = lento, 1 = normal, 1.3 = rápido). A new call cancels the previous.
 */
export async function speakSequence(
  segments: NarrationSegment[],
  opts: { rate?: number } = {}
): Promise<void> {
  stopSynth();
  const myToken = ++sequenceToken;
  const rate = opts.rate ?? 1;
  for (const seg of segments) {
    if (myToken !== sequenceToken) return; // superseded or stopped
    if (!seg.text.trim()) continue;
    try {
      if (seg.lang === "ja") {
        await speakJapanese(seg.text, { rate: rate * 170 });
      } else {
        await speakText(seg.text, seg.lang, rate);
      }
    } catch {
      // A missing voice / engine hiccup on one segment shouldn't abort the rest.
    }
  }
}

/**
 * Speak Japanese text. Resolves when playback finishes, rejects with a
 * `TtsError` on failure (unsupported / no Japanese voice / engine error).
 * A new call cancels any previous utterance so repeated clicks interrupt
 * cleanly.
 */
export async function speakJapanese(
  text: string,
  opts: SpeakOptions = {}
): Promise<void> {
  if (!ttsSupported()) {
    throw new TtsError("unsupported", "Tu sistema no soporta síntesis de voz.");
  }
  const voice = await getJapaneseVoice(opts.voice);
  if (!voice) {
    throw new TtsError(
      "no-voice",
      "No hay voz japonesa instalada. En Windows: Configuración → Hora e idioma → Idioma → agrega Japonés y su paquete de voz."
    );
  }

  stopSynth();

  return new Promise<void>((resolve, reject) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = voice;
    utter.lang = voice.lang || "ja-JP";
    utter.rate = wpmToRate(opts.rate);
    utter.pitch = 1;

    const cleanup = () => {
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = null;
      }
    };
    utter.onend = () => {
      cleanup();
      resolve();
    };
    utter.onerror = (e) => {
      cleanup();
      // "canceled"/"interrupted" happen when the user clicks play again — not a
      // real failure.
      if (e.error === "canceled" || e.error === "interrupted") {
        resolve();
      } else {
        reject(new TtsError("speak-failed", `Falló la reproducción: ${e.error}`));
      }
    };

    // Watchdog: some WebViews never fire onend for long phrases. Estimate a
    // generous cap based on length so the promise always settles.
    const capMs = Math.min(30_000, 4_000 + text.length * 350);
    watchdog = setTimeout(() => {
      cleanup();
      resolve();
    }, capMs);

    window.speechSynthesis.speak(utter);
  });
}
