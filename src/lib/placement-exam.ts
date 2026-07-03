import type { JlptLevel } from "@/lib/api";

/**
 * Offline placement test (N5 → N1).
 *
 * A learner who doesn't know their level takes a short quiz that spans every
 * JLPT band; we score how far up they can go and assign a starting level. All
 * Japanese here is hand-written and verified — never generated.
 *
 * The set of questions is re-shuffled every day (seeded by the date) and only a
 * subset per level is shown, so it isn't the exact same exam twice in a row.
 */
export interface PlacementQuestion {
  level: JlptLevel;
  /** Spanish prompt (what we ask). */
  prompt: string;
  /** Japanese shown in the card (kanji/word/sentence), optional. */
  jp?: string;
  /** 4 options; index 0 is the correct one (we shuffle before showing). */
  options: [string, string, string, string];
}

/** The verified bank, ~5 per level. Option[0] is always the correct answer. */
const BANK: PlacementQuestion[] = [
  // ---- N5 ---------------------------------------------------------------
  { level: "N5", prompt: "¿Qué significa este kanji?", jp: "水", options: ["agua", "fuego", "montaña", "árbol"] },
  { level: "N5", prompt: "¿Qué significa este kanji?", jp: "私", options: ["yo", "tú", "él", "nosotros"] },
  { level: "N5", prompt: "¿Qué significa «食べます»?", jp: "食べます", options: ["comer", "beber", "dormir", "caminar"] },
  { level: "N5", prompt: "Completa: 本＿読みます (leo un libro)", jp: "本＿読みます", options: ["を", "は", "に", "が"] },
  { level: "N5", prompt: "¿Cuál es el kanji de «tres»?", options: ["三", "四", "五", "二"] },

  // ---- N4 ---------------------------------------------------------------
  { level: "N4", prompt: "¿Qué significa esta palabra?", jp: "病院", options: ["hospital", "escuela", "banco", "estación"] },
  { level: "N4", prompt: "¿Qué significa «悪い»?", jp: "悪い", options: ["malo", "bueno", "caro", "barato"] },
  { level: "N4", prompt: "La forma て de «待つ» (esperar) es:", options: ["待って", "待て", "待ちて", "待つて"] },
  { level: "N4", prompt: "¿Cómo se lee «地図» (mapa)?", jp: "地図", options: ["ちず", "じず", "ちと", "じと"] },
  { level: "N4", prompt: "¿Qué significa «急ぐ»?", jp: "急ぐ", options: ["darse prisa", "descansar", "jugar", "esperar"] },

  // ---- N3 ---------------------------------------------------------------
  { level: "N3", prompt: "¿Qué significa «経済»?", jp: "経済", options: ["economía", "política", "cultura", "sociedad"] },
  { level: "N3", prompt: "¿Qué significa «増える»?", jp: "増える", options: ["aumentar", "disminuir", "cambiar", "decidir"] },
  { level: "N3", prompt: "¿Qué significa «準備»?", jp: "準備", options: ["preparación", "resultado", "razón", "experiencia"] },
  { level: "N3", prompt: "¿Qué significa «怒る»?", jp: "怒る", options: ["enojarse", "reír", "llorar", "sorprenderse"] },
  { level: "N3", prompt: "«彼は来るはずです» significa que él…", jp: "来るはず", options: ["debería venir", "no vendrá", "quiere venir", "ya vino"] },

  // ---- N2 ---------------------------------------------------------------
  { level: "N2", prompt: "¿Qué significa «節約»?", jp: "節約", options: ["ahorro", "derroche", "inversión", "ganancia"] },
  { level: "N2", prompt: "¿Qué significa «相談»?", jp: "相談", options: ["consultar", "decidir", "prometer", "rechazar"] },
  { level: "N2", prompt: "¿Qué significa «あいまい»?", jp: "あいまい", options: ["ambiguo", "claro", "seguro", "falso"] },
  { level: "N2", prompt: "¿Qué significa «募集»?", jp: "募集", options: ["convocatoria", "despido", "ascenso", "renuncia"] },
  { level: "N2", prompt: "«学生に違いない» significa que…", jp: "違いない", options: ["sin duda es estudiante", "no es estudiante", "quizá es estudiante", "fue estudiante"] },

  // ---- N1 ---------------------------------------------------------------
  { level: "N1", prompt: "¿Qué significa «憂鬱»?", jp: "憂鬱", options: ["melancolía", "alegría", "ira", "sorpresa"] },
  { level: "N1", prompt: "¿Qué significa «妥協»?", jp: "妥協", options: ["concesión", "conflicto", "victoria", "rechazo"] },
  { level: "N1", prompt: "¿Qué significa «顕著»?", jp: "顕著", options: ["notable", "insignificante", "dudoso", "temporal"] },
  { level: "N1", prompt: "¿Qué significa «懸念»?", jp: "懸念", options: ["preocupación", "alivio", "certeza", "indiferencia"] },
  { level: "N1", prompt: "«辞任を余儀なくされた» significa que…", jp: "余儀なくされた", options: ["se vio obligado a renunciar", "decidió renunciar", "rechazó renunciar", "evitó renunciar"] },
];

const LEVELS: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

/** A question ready to render: prompt + shuffled options + which index is right. */
export interface ExamItem {
  level: JlptLevel;
  prompt: string;
  jp?: string;
  options: string[];
  correctIndex: number;
}

/** Small deterministic PRNG so "today's exam" is stable within a day. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build today's exam: `perLevel` questions from each band, shuffled, with
 * shuffled options. Seeded by the date (+ optional salt) so it varies daily but
 * stays consistent if the user reloads mid-exam.
 */
export function buildPlacementExam(perLevel = 3, salt = ""): ExamItem[] {
  const daySeed = seedFromString(new Date().toDateString() + salt);
  const rand = mulberry32(daySeed);
  const items: ExamItem[] = [];
  for (const level of LEVELS) {
    const pool = shuffle(
      BANK.filter((q) => q.level === level),
      rand
    ).slice(0, perLevel);
    for (const q of pool) {
      const correct = q.options[0];
      const options = shuffle([...q.options], rand);
      items.push({
        level: q.level,
        prompt: q.prompt,
        jp: q.jp,
        options,
        correctIndex: options.indexOf(correct),
      });
    }
  }
  // Present easiest → hardest so the learner ramps up.
  return items.sort(
    (a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)
  );
}

/**
 * Score the exam → the level the learner should START at.
 *
 * For each band we compute the ratio correct. We climb from N5 while the learner
 * clears a band (≥60%) and place them at the FIRST band they don't clear (that's
 * where they need to study). Clear everything → N1. Fail N5 → N5.
 */
export function scorePlacement(
  items: ExamItem[],
  answers: number[]
): { level: JlptLevel; perLevel: Record<JlptLevel, { correct: number; total: number }> } {
  const perLevel = {
    N5: { correct: 0, total: 0 },
    N4: { correct: 0, total: 0 },
    N3: { correct: 0, total: 0 },
    N2: { correct: 0, total: 0 },
    N1: { correct: 0, total: 0 },
  } as Record<JlptLevel, { correct: number; total: number }>;

  items.forEach((it, i) => {
    perLevel[it.level].total += 1;
    if (answers[i] === it.correctIndex) perLevel[it.level].correct += 1;
  });

  const cleared = (l: JlptLevel) => {
    const s = perLevel[l];
    return s.total > 0 && s.correct / s.total >= 0.6;
  };

  // Place the learner at the FIRST band they don't clear (that's where they
  // need to study). Clear every band → N1.
  for (const l of LEVELS) {
    if (!cleared(l)) return { level: l, perLevel };
  }
  return { level: "N1", perLevel };
}
