//! Journal — write in Japanese, get AI corrections from Claude or local Ollama.
//!
//! Two backends:
//! - **Claude API** (paid, best quality) — requires user's API key
//! - **Ollama** (free, local) — needs `ollama serve` running locally with a model pulled.
//!
//! User picks the backend in Settings; setting persisted in the `settings`
//! table under key `ai_backend` with values "claude" | "ollama" | "none".

use chrono::Utc;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::commands::player::award_xp_internal;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{JournalCorrection, JournalCorrectionResponse, JournalEntry, XpAward};

const CLAUDE_MODEL: &str = "claude-opus-4-7";
const CLAUDE_API_URL: &str = "https://api.anthropic.com/v1/messages";
const OLLAMA_DEFAULT_URL: &str = "http://localhost:11434";
const OLLAMA_DEFAULT_MODEL: &str = "llama3.1:8b";
const XP_JOURNAL_ENTRY: i64 = 80;

// ---------------------------------------------------------------------------
// Settings: AI backend + provider-specific config
// ---------------------------------------------------------------------------

fn read_setting(conn: &Connection, key: &str) -> AppResult<Option<String>> {
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        [key],
        |r| r.get::<_, String>(0),
    )
    .map(Some)
    .or_else(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => Ok(None),
        other => Err(AppError::Database(format!("read setting {key}: {other}"))),
    })
}

fn write_setting(conn: &Connection, key: &str, value: &str) -> AppResult<()> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = datetime('now')",
        [key, value],
    )?;
    Ok(())
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AiBackendConfig {
    pub backend: String, // "claude" | "ollama" | "none"
    pub has_claude_key: bool,
    pub ollama_url: String,
    pub ollama_model: String,
}

#[tauri::command]
pub fn get_ai_backend_config(db: State<'_, DbState>) -> AppResult<AiBackendConfig> {
    db.with(|c| {
        let backend = read_setting(c, "ai_backend")?.unwrap_or_else(|| "none".to_string());
        let has_claude_key = read_setting(c, "claude_api_key")?.is_some();
        let ollama_url =
            read_setting(c, "ollama_url")?.unwrap_or_else(|| OLLAMA_DEFAULT_URL.to_string());
        let ollama_model =
            read_setting(c, "ollama_model")?.unwrap_or_else(|| OLLAMA_DEFAULT_MODEL.to_string());
        Ok(AiBackendConfig {
            backend,
            has_claude_key,
            ollama_url,
            ollama_model,
        })
    })
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAiBackendInput {
    pub backend: Option<String>,
    pub claude_api_key: Option<String>,
    pub ollama_url: Option<String>,
    pub ollama_model: Option<String>,
    pub clear_claude_key: Option<bool>,
}

#[tauri::command]
pub fn update_ai_backend(
    db: State<'_, DbState>,
    input: UpdateAiBackendInput,
) -> AppResult<AiBackendConfig> {
    db.with(|c| {
        if let Some(b) = &input.backend {
            if !matches!(b.as_str(), "claude" | "ollama" | "none") {
                return Err(AppError::InvalidInput(format!("backend inválido: {b}")));
            }
            write_setting(c, "ai_backend", b)?;
        }
        if let Some(k) = &input.claude_api_key {
            if !k.trim().is_empty() {
                write_setting(c, "claude_api_key", k.trim())?;
            }
        }
        if input.clear_claude_key.unwrap_or(false) {
            c.execute("DELETE FROM settings WHERE key = 'claude_api_key'", [])?;
        }
        if let Some(u) = &input.ollama_url {
            if !u.trim().is_empty() {
                write_setting(c, "ollama_url", u.trim().trim_end_matches('/'))?;
            }
        }
        if let Some(m) = &input.ollama_model {
            if !m.trim().is_empty() {
                write_setting(c, "ollama_model", m.trim())?;
            }
        }

        let backend = read_setting(c, "ai_backend")?.unwrap_or_else(|| "none".to_string());
        let has_claude_key = read_setting(c, "claude_api_key")?.is_some();
        let ollama_url =
            read_setting(c, "ollama_url")?.unwrap_or_else(|| OLLAMA_DEFAULT_URL.to_string());
        let ollama_model =
            read_setting(c, "ollama_model")?.unwrap_or_else(|| OLLAMA_DEFAULT_MODEL.to_string());
        Ok(AiBackendConfig {
            backend,
            has_claude_key,
            ollama_url,
            ollama_model,
        })
    })
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OllamaStatus {
    pub reachable: bool,
    pub model_present: bool,
    pub installed_models: Vec<String>,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn test_ollama(db: State<'_, DbState>) -> AppResult<OllamaStatus> {
    let (url, model) = db.with(|c| {
        let url = read_setting(c, "ollama_url")?
            .unwrap_or_else(|| OLLAMA_DEFAULT_URL.to_string());
        let model = read_setting(c, "ollama_model")?
            .unwrap_or_else(|| OLLAMA_DEFAULT_MODEL.to_string());
        Ok((url, model))
    })?;

    let client = reqwest::Client::new();
    let tag_url = format!("{}/api/tags", url);
    match client
        .get(&tag_url)
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
    {
        Ok(res) if res.status().is_success() => {
            #[derive(Deserialize)]
            struct TagModel {
                name: String,
            }
            #[derive(Deserialize)]
            struct TagsResponse {
                models: Vec<TagModel>,
            }
            let parsed = res.json::<TagsResponse>().await.unwrap_or(TagsResponse {
                models: vec![],
            });
            let installed: Vec<String> = parsed.models.iter().map(|m| m.name.clone()).collect();
            let model_present = installed.iter().any(|n| n == &model || n.starts_with(&format!("{}:", model)));
            Ok(OllamaStatus {
                reachable: true,
                model_present,
                installed_models: installed,
                error: None,
            })
        }
        Ok(res) => Ok(OllamaStatus {
            reachable: false,
            model_present: false,
            installed_models: vec![],
            error: Some(format!("Ollama respondió con estado {}", res.status())),
        }),
        Err(e) => Ok(OllamaStatus {
            reachable: false,
            model_present: false,
            installed_models: vec![],
            error: Some(format!("No pude conectar a Ollama: {e}")),
        }),
    }
}

// Backwards-compatible shims so existing TS API still works
#[tauri::command]
pub fn set_claude_api_key(db: State<'_, DbState>, key: String) -> AppResult<()> {
    db.with(|c| {
        write_setting(c, "claude_api_key", key.trim())?;
        // If no backend selected yet, default to claude
        if read_setting(c, "ai_backend")?.is_none() {
            write_setting(c, "ai_backend", "claude")?;
        }
        Ok(())
    })
}

#[tauri::command]
pub fn clear_claude_api_key(db: State<'_, DbState>) -> AppResult<()> {
    db.with(|c| {
        c.execute("DELETE FROM settings WHERE key = 'claude_api_key'", [])?;
        Ok(())
    })
}

#[tauri::command]
pub fn has_claude_api_key(db: State<'_, DbState>) -> AppResult<bool> {
    db.with(|c| Ok(read_setting(c, "claude_api_key")?.is_some()))
}

// ---------------------------------------------------------------------------
// Journal CRUD
// ---------------------------------------------------------------------------

fn parse_corrections(raw: Option<String>) -> Vec<JournalCorrection> {
    raw.and_then(|s| serde_json::from_str::<Vec<JournalCorrection>>(&s).ok())
        .unwrap_or_default()
}

fn count_words(text: &str) -> i64 {
    text.split_whitespace().count() as i64
}

fn read_entry(conn: &Connection, id: i64) -> AppResult<JournalEntry> {
    conn.query_row(
        "SELECT id, entry_date, text_jp, text_translation, ai_feedback,
                corrections_json, word_count, created_at
           FROM journal_entries WHERE id = ?1",
        [id],
        |r| {
            let raw: Option<String> = r.get(5)?;
            Ok(JournalEntry {
                id: r.get(0)?,
                entry_date: r.get(1)?,
                text_jp: r.get(2)?,
                text_translation: r.get(3)?,
                ai_feedback: r.get(4)?,
                corrections: parse_corrections(raw),
                word_count: r.get(6)?,
                created_at: r.get(7)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read entry {id}: {e}")))
}

#[tauri::command]
pub fn list_journal(db: State<'_, DbState>, limit: Option<i64>) -> AppResult<Vec<JournalEntry>> {
    let limit = limit.unwrap_or(50).clamp(1, 200);
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT id, entry_date, text_jp, text_translation, ai_feedback,
                    corrections_json, word_count, created_at
               FROM journal_entries
              ORDER BY created_at DESC
              LIMIT ?1",
        )?;
        let rows = stmt.query_map([limit], |r| {
            let raw: Option<String> = r.get(5)?;
            Ok(JournalEntry {
                id: r.get(0)?,
                entry_date: r.get(1)?,
                text_jp: r.get(2)?,
                text_translation: r.get(3)?,
                ai_feedback: r.get(4)?,
                corrections: parse_corrections(raw),
                word_count: r.get(6)?,
                created_at: r.get(7)?,
            })
        })?;
        let mut out = Vec::new();
        for r in rows {
            out.push(r?);
        }
        Ok(out)
    })
}

// ---------------------------------------------------------------------------
// Claude correction
// ---------------------------------------------------------------------------

#[derive(Serialize)]
struct ClaudeRequest<'a> {
    model: &'a str,
    max_tokens: u32,
    system: &'a str,
    messages: Vec<ClaudeMessage<'a>>,
}

#[derive(Serialize)]
struct ClaudeMessage<'a> {
    role: &'a str,
    content: &'a str,
}

#[derive(Deserialize)]
struct ClaudeResponse {
    content: Vec<ClaudeContent>,
}

#[derive(Deserialize)]
struct ClaudeContent {
    #[serde(rename = "type")]
    kind: String,
    text: Option<String>,
}

#[derive(Deserialize)]
struct ClaudeJson {
    feedback: Option<String>,
    translation: Option<String>,
    corrections: Vec<JournalCorrection>,
}

const SYSTEM_PROMPT: &str = "Eres un profesor de japonés cálido y conciso. \
Vas a revisar lo que un estudiante escribió en japonés.\n\n\
Devuelve EXCLUSIVAMENTE un JSON válido con este formato:\n\
{\n\
  \"feedback\": \"breve comentario de aliento + foco principal de mejora, en español, máx 2 frases\",\n\
  \"translation\": \"traducción natural al español del texto del estudiante\",\n\
  \"corrections\": [\n\
    { \"original\": \"fragmento exacto que tenía error\", \"corrected\": \"versión natural\", \"explanation\": \"por qué (español, 1 frase)\", \"category\": \"particle | grammar | spelling | vocab | style\" }\n\
  ]\n\
}\n\n\
- Si el texto está perfecto, devuelve corrections: [].\n\
- No expliques nada fuera del JSON. No uses bloques de código.";

async fn call_claude(api_key: &str, text_jp: &str) -> AppResult<ClaudeJson> {
    let body = ClaudeRequest {
        model: CLAUDE_MODEL,
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: vec![ClaudeMessage {
            role: "user",
            content: text_jp,
        }],
    };

    let client = reqwest::Client::new();
    let res = client
        .post(CLAUDE_API_URL)
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| AppError::AiProvider(format!("claude request: {e}")))?;

    if !res.status().is_success() {
        let status = res.status();
        let err_body = res.text().await.unwrap_or_default();
        return Err(AppError::AiProvider(format!(
            "claude {}: {}",
            status, err_body
        )));
    }

    let parsed: ClaudeResponse = res
        .json()
        .await
        .map_err(|e| AppError::AiProvider(format!("claude parse: {e}")))?;

    let text = parsed
        .content
        .into_iter()
        .find(|c| c.kind == "text")
        .and_then(|c| c.text)
        .ok_or_else(|| AppError::AiProvider("claude returned no text".into()))?;

    let trimmed = text.trim();
    // Some models wrap in ```json fences; strip them defensively.
    let cleaned = trimmed
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();

    serde_json::from_str::<ClaudeJson>(cleaned).map_err(|e| {
        AppError::AiProvider(format!("invalid claude JSON: {e} — body: {cleaned}"))
    })
}

// ---------------------------------------------------------------------------
// Ollama (local model)
// ---------------------------------------------------------------------------

#[derive(Serialize)]
struct OllamaRequest<'a> {
    model: &'a str,
    prompt: String,
    system: &'a str,
    stream: bool,
    format: &'a str,
    options: OllamaOptions,
}

#[derive(Serialize)]
struct OllamaOptions {
    temperature: f32,
    num_predict: i32,
}

#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
}

async fn call_ollama(url: &str, model: &str, text_jp: &str) -> AppResult<ClaudeJson> {
    let body = OllamaRequest {
        model,
        prompt: format!("Texto del estudiante: {text_jp}"),
        system: SYSTEM_PROMPT,
        stream: false,
        format: "json",
        options: OllamaOptions {
            temperature: 0.2,
            num_predict: 800,
        },
    };

    let endpoint = format!("{}/api/generate", url);
    let client = reqwest::Client::new();
    let res = client
        .post(&endpoint)
        .json(&body)
        .timeout(std::time::Duration::from_secs(60))
        .send()
        .await
        .map_err(|e| AppError::AiProvider(format!("ollama request: {e}")))?;

    if !res.status().is_success() {
        let status = res.status();
        let err_body = res.text().await.unwrap_or_default();
        return Err(AppError::AiProvider(format!(
            "ollama {}: {}",
            status, err_body
        )));
    }

    let parsed: OllamaResponse = res
        .json()
        .await
        .map_err(|e| AppError::AiProvider(format!("ollama parse: {e}")))?;

    let trimmed = parsed.response.trim();
    let cleaned = trimmed
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();

    serde_json::from_str::<ClaudeJson>(cleaned).map_err(|e| {
        AppError::AiProvider(format!("invalid ollama JSON: {e} — body: {cleaned}"))
    })
}

#[tauri::command]
pub async fn create_journal_entry(
    db: State<'_, DbState>,
    text_jp: String,
) -> AppResult<JournalCorrectionResponse> {
    let trimmed = text_jp.trim().to_string();
    if trimmed.is_empty() {
        return Err(AppError::InvalidInput("la entrada está vacía".into()));
    }

    // Read backend config in a single lock
    let (backend, claude_key, ollama_url, ollama_model) = db.with(|c| {
        let backend = read_setting(c, "ai_backend")?.unwrap_or_else(|| "none".to_string());
        let key = read_setting(c, "claude_api_key")?;
        let url = read_setting(c, "ollama_url")?
            .unwrap_or_else(|| OLLAMA_DEFAULT_URL.to_string());
        let model = read_setting(c, "ollama_model")?
            .unwrap_or_else(|| OLLAMA_DEFAULT_MODEL.to_string());
        Ok((backend, key, url, model))
    })?;

    let (feedback, translation, corrections) = match backend.as_str() {
        "claude" => match claude_key {
            Some(k) if !k.is_empty() => match call_claude(&k, &trimmed).await {
                Ok(j) => (j.feedback, j.translation, j.corrections),
                Err(e) => {
                    log::warn!("claude call failed: {e}");
                    (Some(format!("Claude falló: {e}")), None, vec![])
                }
            },
            _ => (
                Some(
                    "Configura tu API key de Claude en Ajustes → IA para activar correcciones."
                        .into(),
                ),
                None,
                vec![],
            ),
        },
        "ollama" => match call_ollama(&ollama_url, &ollama_model, &trimmed).await {
            Ok(j) => (j.feedback, j.translation, j.corrections),
            Err(e) => {
                log::warn!("ollama call failed: {e}");
                (
                    Some(format!(
                        "Ollama no respondió. ¿Está corriendo `ollama serve` y tienes \"{ollama_model}\" instalado? Detalle: {e}"
                    )),
                    None,
                    vec![],
                )
            }
        },
        _ => (
            Some(
                "Elige un backend de IA en Ajustes → IA (Claude API o local con Ollama) para activar correcciones."
                    .into(),
            ),
            None,
            vec![],
        ),
    };

    let now = Utc::now();
    let today = now.format("%Y-%m-%d").to_string();
    let word_count = count_words(&trimmed);
    let corrections_json = serde_json::to_string(&corrections)?;

    db.with(|c| {
        c.execute(
            "INSERT INTO journal_entries (entry_date, text_jp, text_translation,
                                         ai_feedback, corrections_json, word_count)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                today,
                trimmed,
                translation,
                feedback,
                corrections_json,
                word_count
            ],
        )?;

        let id: i64 = c.last_insert_rowid();

        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, correct, duration_seconds, metadata)
             VALUES ('journal', ?1, 1, 0, NULL)",
            [id],
        )?;

        // Update error patterns aggregate
        for corr in &corrections {
            if let Some(category) = &corr.category {
                c.execute(
                    "INSERT INTO error_patterns (pattern_key, label, description, category, occurrences, last_seen_at)
                     VALUES (?1, ?2, ?3, ?4, 1, datetime('now'))
                     ON CONFLICT(pattern_key) DO UPDATE SET
                         occurrences = occurrences + 1,
                         last_seen_at = datetime('now')",
                    params![
                        format!("{}-{}", category, corr.original),
                        corr.original,
                        corr.explanation,
                        category
                    ],
                )?;
            }
        }

        let (xp_effective, change) =
            award_xp_internal(c, XP_JOURNAL_ENTRY, "journal_entry", Some(&id.to_string()), now)?;

        Ok(JournalCorrectionResponse {
            entry: read_entry(c, id)?,
            award: XpAward {
                xp_amount: xp_effective,
                star_amount: 0,
                leveled_up: change.leveled_up,
                new_level: change.new_level,
                previous_level: change.previous_level,
                completed_daily: vec![],
                completed_weekly: vec![],
            },
        })
    })
}

#[tauri::command]
pub fn delete_journal_entry(db: State<'_, DbState>, entry_id: i64) -> AppResult<()> {
    db.with(|c| {
        c.execute("DELETE FROM journal_entries WHERE id = ?1", [entry_id])?;
        Ok(())
    })
}
