//! Recommendation engine: figures out what the user should do right now.
//!
//! The logic is intentionally rule-based (not LLM-driven yet) so it works
//! offline and is fast. When Claude API is wired up later, we can ask it
//! to refine the *copy* of the recommendation but keep this engine as the
//! source of truth for *which action* to take.

use rusqlite::Connection;
use serde::Serialize;
use tauri::State;

use crate::db::DbState;
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NextAction {
    pub key: String,
    pub title: String,
    pub subtitle: String,
    pub jp_subtitle: String,
    pub cta_label: String,
    pub module_path: String,
    pub icon: String,
    pub urgency: String, // "high" | "medium" | "low"
    pub estimated_minutes: i64,
    pub kanji_hint: String,
}

fn count(conn: &Connection, sql: &str) -> AppResult<i64> {
    conn.query_row(sql, [], |r| r.get(0))
        .map_err(|e| AppError::Database(format!("count: {e}")))
}

fn next_pending_lesson(
    c: &Connection,
) -> AppResult<Option<(i64, String, Option<String>, Option<String>, i64)>> {
    let row = c.query_row(
        "SELECT l.id, l.title, l.jp_title, l.summary, l.duration_minutes
           FROM lessons l
           LEFT JOIN lesson_progress p ON p.lesson_id = l.id
           JOIN units u ON u.id = l.unit_id
          WHERE COALESCE(p.status, 'available') != 'completed'
          ORDER BY u.ordering, l.ordering, l.id
          LIMIT 1",
        [],
        |r| {
            Ok((
                r.get(0)?,
                r.get(1)?,
                r.get(2)?,
                r.get(3)?,
                r.get(4)?,
            ))
        },
    );
    match row {
        Ok(t) => Ok(Some(t)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(AppError::Database(format!("next pending lesson: {e}"))),
    }
}

fn count_param(conn: &Connection, sql: &str, p: &str) -> AppResult<i64> {
    conn.query_row(sql, [p], |r| r.get(0))
        .map_err(|e| AppError::Database(format!("count: {e}")))
}

#[tauri::command]
pub fn get_next_action(db: State<'_, DbState>) -> AppResult<NextAction> {
    db.with(|c| compute(c))
}

fn compute(c: &Connection) -> AppResult<NextAction> {
    // 1. Highest priority: next pending lesson — the e-learning loop.
    if let Some(next) = next_pending_lesson(c)? {
        let is_first: bool = c
            .query_row(
                "SELECT CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END
                   FROM lesson_progress WHERE status = 'completed'",
                [],
                |r| r.get(0),
            )
            .unwrap_or(1) == 1;
        let (lesson_id, title, jp_title, summary, duration) = next;
        return Ok(NextAction {
            key: if is_first {
                "first_lesson".into()
            } else {
                "continue_lesson".into()
            },
            title: if is_first {
                "Vamos con tu primera lección".into()
            } else {
                title.clone()
            },
            subtitle: if is_first {
                "Un mix guiado de kanji, gramática, escucha y voz. Sin saltarte nada importante.".into()
            } else {
                summary.unwrap_or_else(|| format!("Continúa con \"{title}\""))
            },
            jp_subtitle: jp_title.unwrap_or_else(|| "授業".into()),
            cta_label: if is_first {
                "Empezar lección 1".into()
            } else {
                "Continuar lección".into()
            },
            module_path: format!("/learn/{lesson_id}"),
            icon: "book-open".into(),
            urgency: if is_first { "high".into() } else { "medium".into() },
            estimated_minutes: duration.max(5),
            kanji_hint: if is_first { "始".into() } else { "次".into() },
        });
    }

    let kanji_due_now = count(
        c,
        "SELECT COUNT(*) FROM srs_items
          WHERE item_type = 'kanji' AND next_review_at <= datetime('now')",
    )?;
    let kanji_in_pool = count(
        c,
        "SELECT COUNT(*) FROM srs_items WHERE item_type = 'kanji'",
    )?;
    let kanji_mastered = count(
        c,
        "SELECT COUNT(*) FROM srs_items WHERE item_type = 'kanji' AND repetitions >= 3",
    )?;
    let kanji_available_new = count(
        c,
        "SELECT COUNT(*) FROM kanji k
          WHERE NOT EXISTS (
              SELECT 1 FROM srs_items s
               WHERE s.item_type = 'kanji' AND s.item_id = k.id
          )",
    )?;

    let grammar_started = count(
        c,
        "SELECT COUNT(*) FROM grammar_progress WHERE status <> 'new'",
    )?;
    let grammar_mastered = count(
        c,
        "SELECT COUNT(*) FROM grammar_progress WHERE status = 'mastered'",
    )?;

    let journal_today = count_param(
        c,
        "SELECT COUNT(*) FROM journal_entries WHERE entry_date = ?1",
        &chrono::Utc::now().format("%Y-%m-%d").to_string(),
    )?;

    let listening_done = count(
        c,
        "SELECT COUNT(*) FROM activity_log WHERE activity_type = 'listening'",
    )?;

    let speaking_done = count(
        c,
        "SELECT COUNT(*) FROM activity_log WHERE activity_type = 'speaking'",
    )?;

    // ----- Decision tree (priority order) -----

    // 1. Brand-new user: no kanji introduced yet
    if kanji_in_pool == 0 {
        return Ok(NextAction {
            key: "introduce_first_kanji".into(),
            title: "Empieza con tu primer kanji".into(),
            subtitle: "Aprenderás 始 — 'comenzar'. Te tomará 2 minutos y comenzarás tu colección.".into(),
            jp_subtitle: "始めよう".into(),
            cta_label: "Aprender mi primer kanji".into(),
            module_path: "/kanji".into(),
            icon: "pen-tool".into(),
            urgency: "high".into(),
            estimated_minutes: 2,
            kanji_hint: "始".into(),
        });
    }

    // 2. SRS reviews due
    if kanji_due_now > 0 {
        return Ok(NextAction {
            key: "review_kanji_srs".into(),
            title: format!(
                "Tienes {} repaso{} esperando",
                kanji_due_now,
                if kanji_due_now == 1 { "" } else { "s" }
            ),
            subtitle: "Sostener lo aprendido vale más que aprender más. Empieza por aquí.".into(),
            jp_subtitle: "復習".into(),
            cta_label: "Empezar repaso".into(),
            module_path: "/kanji/review".into(),
            icon: "repeat".into(),
            urgency: "high".into(),
            estimated_minutes: kanji_due_now.min(15),
            kanji_hint: "復".into(),
        });
    }

    // 3. New kanji to learn (haven't reached the mastery floor yet)
    if kanji_mastered < 10 && kanji_available_new > 0 {
        return Ok(NextAction {
            key: "introduce_new_kanji".into(),
            title: format!(
                "Aprende {} kanji nuevo{}",
                3.min(kanji_available_new),
                if kanji_available_new == 1 { "" } else { "s" }
            ),
            subtitle: format!(
                "Tienes {} kanji dominado{}. Sigue construyendo tu base.",
                kanji_mastered,
                if kanji_mastered == 1 { "" } else { "s" }
            ),
            jp_subtitle: "新しい漢字".into(),
            cta_label: "Ver catálogo de kanji".into(),
            module_path: "/kanji".into(),
            icon: "plus".into(),
            urgency: "medium".into(),
            estimated_minutes: 6,
            kanji_hint: "学".into(),
        });
    }

    // 4. Grammar unlock: 10+ kanji mastered, no grammar started
    if kanji_mastered >= 10 && grammar_started == 0 {
        return Ok(NextAction {
            key: "unlock_grammar".into(),
            title: "Ya tienes base de kanji — empieza gramática".into(),
            subtitle: "Con 10+ kanji ya puedes construir frases reales. Te recomiendo empezar con は y です.".into(),
            jp_subtitle: "文法を始めよう".into(),
            cta_label: "Empezar primera lección".into(),
            module_path: "/grammar".into(),
            icon: "book-open".into(),
            urgency: "high".into(),
            estimated_minutes: 8,
            kanji_hint: "始".into(),
        });
    }

    // 5. Journal: no entry today, has some grammar
    if journal_today == 0 && grammar_started >= 1 {
        return Ok(NextAction {
            key: "write_journal".into(),
            title: "Escribe una frase de hoy".into(),
            subtitle: "Aplica lo aprendido. Escribe una sola frase sobre tu día — yo corrijo.".into(),
            jp_subtitle: "今日の日記".into(),
            cta_label: "Abrir diario".into(),
            module_path: "/journal".into(),
            icon: "feather".into(),
            urgency: "medium".into(),
            estimated_minutes: 5,
            kanji_hint: "日".into(),
        });
    }

    // 6. Listening unlock: grammar progressing, no listening yet
    if grammar_mastered >= 3 && listening_done == 0 {
        return Ok(NextAction {
            key: "unlock_listening".into(),
            title: "Es momento de escuchar".into(),
            subtitle: "Con la gramática base ya puedes seguir conversaciones cortas. Probemos listening.".into(),
            jp_subtitle: "聴解を始めよう".into(),
            cta_label: "Empezar listening".into(),
            module_path: "/listening".into(),
            icon: "headphones".into(),
            urgency: "high".into(),
            estimated_minutes: 6,
            kanji_hint: "聴".into(),
        });
    }

    // 7. Speaking unlock: listening done, no speaking yet
    if listening_done >= 3 && speaking_done == 0 {
        return Ok(NextAction {
            key: "unlock_speaking".into(),
            title: "Hablemos en voz alta".into(),
            subtitle: "Has escuchado bastante. Practiquemos pronunciar lo que ya entiendes.".into(),
            jp_subtitle: "会話を始めよう".into(),
            cta_label: "Empezar speaking".into(),
            module_path: "/speaking".into(),
            icon: "mic".into(),
            urgency: "high".into(),
            estimated_minutes: 5,
            kanji_hint: "話".into(),
        });
    }

    // 8. Maintain grammar progress
    if grammar_started > 0 && grammar_mastered < grammar_started {
        return Ok(NextAction {
            key: "continue_grammar".into(),
            title: "Continúa tu próxima lección de gramática".into(),
            subtitle: "Tienes lecciones en progreso. Termina una para subir tu confianza.".into(),
            jp_subtitle: "文法を続けよう".into(),
            cta_label: "Ir a gramática".into(),
            module_path: "/grammar".into(),
            icon: "book-open".into(),
            urgency: "medium".into(),
            estimated_minutes: 6,
            kanji_hint: "続".into(),
        });
    }

    // 9. Default: maintain kanji
    Ok(NextAction {
        key: "maintain_kanji".into(),
        title: "Día limpio — adelanta repasos".into(),
        subtitle: "No tienes nada urgente. Buen momento para aprender 2-3 kanjis nuevos.".into(),
        jp_subtitle: "前進しよう".into(),
        cta_label: "Ver catálogo".into(),
        module_path: "/kanji".into(),
        icon: "sparkles".into(),
        urgency: "low".into(),
        estimated_minutes: 5,
        kanji_hint: "前".into(),
    })
}
