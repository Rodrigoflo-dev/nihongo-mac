#!/usr/bin/env node
/**
 * Bundle stroke-order data (hanzi-writer / KanjiVG-style) for OFFLINE use.
 *
 * Copies the per-character JSON files from `hanzi-writer-data` into
 * `public/kanji-data/<char>.json`, but ONLY for the kanji that actually appear
 * in our curriculum (the seed kanji JSON files + any `kanjiChar` referenced in
 * the lesson migrations). This keeps the bundle small while letting the stroke
 * trainer work with no network. Kanji without data fall back to trace mode.
 *
 * Run: `npm run bundle:kanji` (also wired into prebuild).
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(root, "node_modules", "hanzi-writer-data");
const OUT_DIR = join(root, "public", "kanji-data");
const SEED_DIR = join(root, "src-tauri", "src", "seed");
const MIGRATIONS_DIR = join(root, "src-tauri", "migrations");

const KANJI_RE = /[一-鿿]/gu;

const chars = new Set();

// 1) From seed kanji JSON files (each has a `character` field).
if (existsSync(SEED_DIR)) {
  for (const f of readdirSync(SEED_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      const data = JSON.parse(readFileSync(join(SEED_DIR, f), "utf8"));
      if (Array.isArray(data)) {
        for (const k of data) {
          if (typeof k?.character === "string") {
            for (const m of k.character.match(KANJI_RE) ?? []) chars.add(m);
          }
        }
      }
    } catch (e) {
      console.warn(`skip ${f}: ${e.message}`);
    }
  }
}

// 2) Any kanji referenced inside lesson migrations (write_kanji etc.).
if (existsSync(MIGRATIONS_DIR)) {
  for (const f of readdirSync(MIGRATIONS_DIR)) {
    if (!f.endsWith(".sql")) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, f), "utf8");
    for (const m of sql.match(KANJI_RE) ?? []) chars.add(m);
  }
}

if (!existsSync(DATA_DIR)) {
  console.error("hanzi-writer-data not installed; run npm install first.");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

let copied = 0;
let missing = 0;
for (const ch of chars) {
  const src = join(DATA_DIR, `${ch}.json`);
  if (existsSync(src)) {
    copyFileSync(src, join(OUT_DIR, `${ch}.json`));
    copied++;
  } else {
    missing++;
  }
}

console.log(
  `kanji-data: ${copied} bundled, ${missing} without stroke data (will use trace mode), from ${chars.size} unique kanji.`
);
