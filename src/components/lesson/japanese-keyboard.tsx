import * as React from "react";
import { motion } from "framer-motion";
import { Delete, KeyRound, Space } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * On-screen Japanese keyboard for users who don't have a Japanese IME
 * installed on their system. Provides both hiragana and katakana, plus
 * the punctuation marks that show up most often in N5 lessons.
 *
 * Each tap appends a character to the textarea (via the `onInsert` callback).
 * Backspace removes the last character.
 */

type Mode = "hiragana" | "katakana" | "punctuation";

const HIRAGANA_ROWS: string[][] = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["さ", "し", "す", "せ", "そ"],
  ["た", "ち", "つ", "て", "と"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ま", "み", "む", "め", "も"],
  ["や", "", "ゆ", "", "よ"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", "を", "ん", "ー", "っ"],
];

const HIRAGANA_DAKUTEN: string[][] = [
  ["が", "ぎ", "ぐ", "げ", "ご"],
  ["ざ", "じ", "ず", "ぜ", "ぞ"],
  ["だ", "ぢ", "づ", "で", "ど"],
  ["ば", "び", "ぶ", "べ", "ぼ"],
  ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
];

const KATAKANA_ROWS: string[][] = [
  ["ア", "イ", "ウ", "エ", "オ"],
  ["カ", "キ", "ク", "ケ", "コ"],
  ["サ", "シ", "ス", "セ", "ソ"],
  ["タ", "チ", "ツ", "テ", "ト"],
  ["ナ", "ニ", "ヌ", "ネ", "ノ"],
  ["ハ", "ヒ", "フ", "ヘ", "ホ"],
  ["マ", "ミ", "ム", "メ", "モ"],
  ["ヤ", "", "ユ", "", "ヨ"],
  ["ラ", "リ", "ル", "レ", "ロ"],
  ["ワ", "ヲ", "ン", "ー", "ッ"],
];

const KATAKANA_DAKUTEN: string[][] = [
  ["ガ", "ギ", "グ", "ゲ", "ゴ"],
  ["ザ", "ジ", "ズ", "ゼ", "ゾ"],
  ["ダ", "ヂ", "ヅ", "デ", "ド"],
  ["バ", "ビ", "ブ", "ベ", "ボ"],
  ["パ", "ピ", "プ", "ペ", "ポ"],
];

const PUNCTUATION: string[][] = [
  ["。", "、", "?", "!", "「"],
  ["」", "・", "〜", "（", "）"],
];

interface JapaneseKeyboardProps {
  onInsert: (char: string) => void;
  onBackspace: () => void;
  /** Common kanji vocab from the lesson the user just learned (optional). */
  quickKanji?: string[];
}

export function JapaneseKeyboard({
  onInsert,
  onBackspace,
  quickKanji = [],
}: JapaneseKeyboardProps) {
  const [mode, setMode] = React.useState<Mode>("hiragana");
  const [showDakuten, setShowDakuten] = React.useState(false);

  const rows =
    mode === "hiragana"
      ? showDakuten
        ? HIRAGANA_DAKUTEN
        : HIRAGANA_ROWS
      : mode === "katakana"
        ? showDakuten
          ? KATAKANA_DAKUTEN
          : KATAKANA_ROWS
        : PUNCTUATION;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl glass p-4"
    >
      {/* Mode tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <div className="inline-flex items-center gap-1 rounded-lg bg-secondary/40 p-1">
          <ModeButton active={mode === "hiragana"} onClick={() => setMode("hiragana")}>
            ひらがな
          </ModeButton>
          <ModeButton active={mode === "katakana"} onClick={() => setMode("katakana")}>
            カタカナ
          </ModeButton>
          <ModeButton
            active={mode === "punctuation"}
            onClick={() => setMode("punctuation")}
          >
            記号
          </ModeButton>
        </div>
        {mode !== "punctuation" ? (
          <Button
            size="sm"
            variant={showDakuten ? "default" : "outline"}
            className="h-7 px-2 text-[11px]"
            onClick={() => setShowDakuten((v) => !v)}
          >
            ゛゜ Dakuten
          </Button>
        ) : null}
        <div className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <KeyRound className="size-3" />
          Toca para escribir
        </div>
      </div>

      {/* Quick kanji shortcuts */}
      {quickKanji.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="self-center text-[10px] uppercase tracking-widest text-muted-foreground">
            Kanji rápidos
          </span>
          {quickKanji.map((k) => (
            <Key key={k} onClick={() => onInsert(k)}>
              {k}
            </Key>
          ))}
        </div>
      ) : null}

      {/* Main grid */}
      <div className="space-y-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-5 gap-1.5">
            {row.map((char, ci) =>
              char ? (
                <Key key={`${ri}-${ci}`} onClick={() => onInsert(char)}>
                  {char}
                </Key>
              ) : (
                <div key={`${ri}-${ci}`} />
              )
            )}
          </div>
        ))}
      </div>

      {/* Action row */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-10"
          onClick={() => onInsert(" ")}
        >
          <Space className="size-3.5" />
          Espacio
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 col-span-2"
          onClick={onBackspace}
        >
          <Delete className="size-3.5" />
          Borrar
        </Button>
      </div>
    </motion.div>
  );
}

function Key({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center rounded-lg border bg-card/60 font-jp text-lg",
        "transition-colors hover:border-primary/40 hover:bg-accent/40 active:bg-primary/10"
      )}
    >
      {children}
    </motion.button>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 font-jp text-xs transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
