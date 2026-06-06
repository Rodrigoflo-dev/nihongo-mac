-- 009_beta_reset.sql
-- Beta clean slate: wipe all user progress so everyone starts from zero after
-- this update. Curriculum seed data (kanji, vocabulary, grammar_lessons,
-- courses, units, lessons, reading_passages, listening_dialogues, achievements,
-- rewards) is intentionally preserved. This is a versioned migration so it runs
-- exactly once per database.

-- Per-item / per-activity progress
DELETE FROM lesson_progress;
DELETE FROM grammar_progress;
DELETE FROM reading_progress;
DELETE FROM listening_progress;
DELETE FROM unit_exam_progress;
DELETE FROM minigame_scores;
DELETE FROM srs_items;

-- Gamification ledgers
DELETE FROM daily_missions;
DELETE FROM weekly_missions;
DELETE FROM xp_events;
DELETE FROM achievement_unlocks;
DELETE FROM reward_purchases;

-- Activity / journaling history
DELETE FROM daily_sessions;
DELETE FROM activity_log;
DELETE FROM journal_entries;
DELETE FROM error_patterns;
DELETE FROM study_plans;

-- Drop any leftover AI backend settings (feature removed)
DELETE FROM settings
 WHERE key = 'ai_backend'
    OR key LIKE 'claude%'
    OR key LIKE 'ollama%';

-- Reset singleton player + streak state to defaults
UPDATE player_state
   SET level = 1,
       total_xp = 0,
       current_level_xp = 0,
       stars = 0,
       rest_days_available = 0,
       rest_day_active_on = NULL,
       double_xp_until = NULL,
       last_level_up_at = NULL,
       title = 'Aprendiz',
       title_jp = '初心者',
       updated_at = datetime('now')
 WHERE id = 1;

UPDATE streak_state
   SET current_streak = 0,
       longest_streak = 0,
       last_active_date = NULL,
       freeze_count = 0
 WHERE id = 1;

-- Force onboarding to run again for a fresh start
UPDATE user_profile
   SET onboarded_at = NULL,
       updated_at = datetime('now')
 WHERE id = 1;
