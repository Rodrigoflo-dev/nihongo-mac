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

// ---------------------------------------------------------------------------
// Voice preferences — the learner can pick which installed voice to use for
// each language (Settings → Voz). Saved on the device (localStorage), since the
// available voices differ per computer.
// ---------------------------------------------------------------------------

export type VoiceKind = "ja" | "es" | "en";
const VOICE_PREF_KEY = "nihongo.voices";
let preferredVoiceNames: Partial<Record<VoiceKind, string>> = loadVoicePrefs();

function loadVoicePrefs(): Partial<Record<VoiceKind, string>> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(VOICE_PREF_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<VoiceKind, string>>) : {};
  } catch {
    return {};
  }
}

export function getPreferredVoiceName(kind: VoiceKind): string | null {
  return preferredVoiceNames[kind] ?? null;
}

export function setPreferredVoiceName(kind: VoiceKind, name: string | null) {
  if (name) preferredVoiceNames[kind] = name;
  else delete preferredVoiceNames[kind];
  try {
    window.localStorage.setItem(
      VOICE_PREF_KEY,
      JSON.stringify(preferredVoiceNames)
    );
  } catch {
    /* ignore quota / disabled storage */
  }
}

/** All installed voices grouped by the languages we narrate in. */
export async function listVoicesByLang(): Promise<
  Record<VoiceKind, SpeechSynthesisVoice[]>
> {
  const voices = await loadVoices();
  return {
    ja: voices.filter(isJapanese),
    es: voices.filter((v) => /^es(\b|[-_])/i.test(v.lang)),
    en: voices.filter((v) => /^en(\b|[-_])/i.test(v.lang)),
  };
}

/**
 * Find a Japanese voice. Priority: an explicit `preferred` name (e.g. the
 * dialogue's "Otoya"), then the learner's saved preference, then the first
 * available Japanese voice.
 */
export async function getJapaneseVoice(
  preferred?: string
): Promise<SpeechSynthesisVoice | null> {
  const voices = (await loadVoices()).filter(isJapanese);
  if (voices.length === 0) return null;
  const want = preferred ?? getPreferredVoiceName("ja") ?? undefined;
  if (want) {
    const match = voices.find((v) =>
      v.name.toLowerCase().includes(want.toLowerCase())
    );
    if (match) return match;
  }
  return pickBestVoice(voices);
}

/** Prefer higher-quality (non-"compact") local voices — they sound less robotic. */
function pickBestVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const nonCompact = voices.filter((v) => !/compact|eloquence/i.test(v.name));
  const pool = nonCompact.length ? nonCompact : voices;
  return pool.find((v) => v.localService) ?? pool[0];
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
  // The learner's saved choice wins…
  const pref = getPreferredVoiceName(lang);
  if (pref) {
    const chosen = matches.find((v) => v.name === pref);
    if (chosen) return chosen;
  }
  // …otherwise prefer a higher-quality local voice.
  return pickBestVoice(matches);
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

// Hiragana, katakana, CJK ideographs, prolonged mark ー and iteration mark 々.
const JAPANESE_CHAR =
  /[぀-ヿ㐀-䶿一-鿿ー々ｦ-ﾟ]/;

/**
 * Drop furigana-style reading glosses — "(わたし)" right after a kanji — from the
 * SPOKEN text only (the visible text keeps them). Otherwise "私 (わたし)" is read
 * "watashi … watashi". Parentheticals that aren't pure kana (e.g. "(しりつ,
 * privado)") are kept.
 */
function stripKanaGlosses(text: string): string {
  return text
    .replace(/[（(]\s*[぀-ヿー]+\s*[)）]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Split a mixed explanation (mostly Spanish/English with inline Japanese like
 * "私 (わたし) es la forma…") into segments, so the Japanese runs are read with a
 * Japanese voice and the rest in the explanation language. Runs that are only
 * punctuation/spaces are dropped.
 */
export function toMixedSegments(
  text: string,
  lang: NarrationLang
): NarrationSegment[] {
  const segments: NarrationSegment[] = [];
  let buf = "";
  let bufJp = false;
  const flush = () => {
    const t = buf.trim();
    if (t && /[\p{L}\p{N}]/u.test(t)) {
      segments.push({ text: t, lang: bufJp ? "ja" : lang });
    }
    buf = "";
  };
  for (const ch of stripKanaGlosses(text)) {
    const jp = JAPANESE_CHAR.test(ch);
    if (buf && jp !== bufJp) flush();
    if (!buf) bufJp = jp;
    buf += ch;
  }
  flush();
  return segments;
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
  // A short silence between chunks so items don't run together ("shi … watashi"
  // instead of "shiwatashi"). Longer when reading slowly.
  const gapMs = Math.round(280 / rate);
  for (let i = 0; i < segments.length; i++) {
    if (myToken !== sequenceToken) return; // superseded or stopped
    const seg = segments[i];
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
    if (i < segments.length - 1 && myToken === sequenceToken) {
      await new Promise((r) => setTimeout(r, gapMs));
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
