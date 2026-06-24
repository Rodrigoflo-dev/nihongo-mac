use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserProfile {
    pub id: i64,
    pub name: String,
    pub target_level: String,
    pub current_level: String,
    pub knows_hiragana: bool,
    pub knows_katakana: bool,
    pub daily_minutes_goal: i64,
    pub reminder_time: Option<String>,
    pub locale: String,
    pub onboarded_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateUserProfileInput {
    pub name: Option<String>,
    pub target_level: Option<String>,
    pub current_level: Option<String>,
    pub knows_hiragana: Option<bool>,
    pub knows_katakana: Option<bool>,
    pub daily_minutes_goal: Option<i64>,
    pub reminder_time: Option<String>,
    pub locale: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompleteOnboardingInput {
    pub name: String,
    pub current_level: String,
    pub target_level: String,
    pub knows_hiragana: bool,
    pub knows_katakana: bool,
    pub daily_minutes_goal: i64,
    pub reminder_time: Option<String>,
}

// ---------------------------------------------------------------------------
// Player progression — XP + levels + stars (currency) + boosts
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerState {
    pub level: i64,
    pub total_xp: i64,
    pub current_level_xp: i64,
    pub xp_to_next_level: i64,
    pub progress_pct: i64,
    pub stars: i64,
    pub title: String,
    pub title_jp: String,
    pub rest_days_available: i64,
    pub rest_day_active_today: bool,
    pub double_xp_until: Option<String>,
    pub double_xp_active: bool,
    /// Unused "XP doble" boosts the player has bought and can activate.
    pub double_xp_available: i64,
    pub last_level_up_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyMission {
    pub id: i64,
    pub kind: String,
    pub title: String,
    pub description: String,
    pub target_value: i64,
    pub progress: i64,
    pub xp_reward: i64,
    pub star_reward: i64,
    pub completed: bool,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WeeklyMission {
    pub id: i64,
    pub kind: String,
    pub title: String,
    pub description: String,
    pub target_value: i64,
    pub progress: i64,
    pub xp_reward: i64,
    pub star_reward: i64,
    pub completed: bool,
    pub completed_at: Option<String>,
    pub week_start: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct XpAward {
    pub xp_amount: i64,
    pub star_amount: i64,
    pub leveled_up: bool,
    pub new_level: i64,
    pub previous_level: i64,
    pub completed_daily: Vec<DailyMission>,
    pub completed_weekly: Vec<WeeklyMission>,
}

// ---------------------------------------------------------------------------
// Rewards shop
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Reward {
    pub id: i64,
    pub key: String,
    pub name: String,
    pub description: String,
    pub icon: Option<String>,
    pub cost: i64,
    pub kind: String,
    pub owned_quantity: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RewardPurchaseResult {
    pub success: bool,
    pub stars_remaining: i64,
    pub reward: Reward,
}

// ---------------------------------------------------------------------------
// Kanji
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KanjiExample {
    pub jp: String,
    pub reading: String,
    pub meaning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Kanji {
    pub id: i64,
    pub character: String,
    pub meaning_es: String,
    pub meaning_en: Option<String>,
    pub onyomi: Vec<String>,
    pub kunyomi: Vec<String>,
    pub jlpt_level: String,
    pub grade: Option<i64>,
    pub stroke_count: Option<i64>,
    pub examples: Vec<KanjiExample>,
    pub mnemonic: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KanjiSrs {
    pub kanji: Kanji,
    pub repetitions: i64,
    pub interval_days: f64,
    pub ease_factor: f64,
    pub next_review_at: String,
    pub last_reviewed_at: Option<String>,
    pub consecutive_failures: i64,
    pub is_leech: bool,
    pub total_reviews: i64,
    pub total_correct: i64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KanjiListItem {
    pub kanji: Kanji,
    pub status: String,
    pub repetitions: i64,
    pub next_review_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewQueue {
    pub due: Vec<KanjiSrs>,
    pub new_available: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewResult {
    pub srs: KanjiSrs,
    pub award: XpAward,
}

// ---------------------------------------------------------------------------
// Grammar
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GrammarExample {
    pub jp: String,
    pub reading: String,
    pub meaning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizOption {
    pub text: String,
    pub correct: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizQuestion {
    pub id: String,
    pub prompt: String,
    #[serde(default)]
    pub prompt_jp: Option<String>,
    pub options: Vec<QuizOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GrammarLessonData {
    pub examples: Vec<GrammarExample>,
    pub quiz: Vec<QuizQuestion>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GrammarLesson {
    pub id: i64,
    pub title: String,
    pub jlpt_level: String,
    pub category: Option<String>,
    pub explanation_md: String,
    pub structure: Option<String>,
    pub examples: Vec<GrammarExample>,
    pub quiz: Vec<QuizQuestion>,
    pub difficulty: i64,
    pub ordering: i64,
    pub status: String,
    pub confidence: i64,
    pub last_quiz_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GrammarListItem {
    pub id: i64,
    pub title: String,
    pub jlpt_level: String,
    pub category: Option<String>,
    pub structure: Option<String>,
    pub status: String,
    pub confidence: i64,
    pub ordering: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GrammarQuizResult {
    pub score: f64,
    pub correct: i64,
    pub total: i64,
    pub passed: bool,
    pub award: XpAward,
}

// ---------------------------------------------------------------------------
// Guided lessons (Course → Unit → Lesson → Activities)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub jlpt_level: String,
    pub jp_title: Option<String>,
    pub units: Vec<Unit>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Unit {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub jp_title: Option<String>,
    pub ordering: i64,
    pub lessons: Vec<LessonSummary>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LessonSummary {
    pub id: i64,
    pub unit_id: i64,
    pub title: String,
    pub jp_title: Option<String>,
    pub summary: Option<String>,
    pub duration_minutes: i64,
    pub ordering: i64,
    pub status: String,
    pub score: Option<i64>,
    pub best_score: Option<i64>,
    pub completions: i64,
    pub activity_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LessonExample {
    pub jp: String,
    pub reading: String,
    pub meaning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Activity {
    #[serde(rename_all = "camelCase")]
    IntroKanji {
        id: String,
        kanji_char: String,
        meaning: String,
        onyomi: Vec<String>,
        kunyomi: Vec<String>,
        example: Option<LessonExample>,
        note: Option<String>,
    },
    #[serde(rename_all = "camelCase")]
    IntroVocab {
        id: String,
        word: String,
        reading: String,
        meaning: String,
        example: Option<String>,
    },
    #[serde(rename_all = "camelCase")]
    IntroGrammar {
        id: String,
        title: String,
        pattern: String,
        explanation: String,
        example: LessonExample,
    },
    #[serde(rename_all = "camelCase")]
    Quiz {
        id: String,
        prompt: String,
        #[serde(default)]
        prompt_jp: Option<String>,
        options: Vec<String>,
        correct_index: usize,
        #[serde(default)]
        explanation: Option<String>,
    },
    #[serde(rename_all = "camelCase")]
    Listening {
        id: String,
        text_jp: String,
        voice: String,
        prompt: String,
        options: Vec<String>,
        correct_index: usize,
        #[serde(default)]
        explanation: Option<String>,
    },
    #[serde(rename_all = "camelCase")]
    Speaking {
        id: String,
        text_jp: String,
        reading: String,
        meaning: String,
        voice: String,
    },
    #[serde(rename_all = "camelCase")]
    WriteKanji {
        id: String,
        kanji_char: String,
        meaning: String,
        reading: String,
        #[serde(default)]
        note: Option<String>,
    },
    #[serde(rename_all = "camelCase")]
    WriteSentence {
        id: String,
        prompt: String,
        #[serde(default)]
        hint: Option<String>,
        accepted: Vec<String>,
        explanation: String,
    },
    Summary {
        id: String,
        learned: Vec<String>,
    },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LessonActivities {
    pub activities: Vec<Activity>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Lesson {
    pub id: i64,
    pub unit_id: i64,
    pub title: String,
    pub jp_title: Option<String>,
    pub summary: Option<String>,
    pub duration_minutes: i64,
    pub ordering: i64,
    pub status: String,
    pub activities: Vec<Activity>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LessonResult {
    pub lesson_id: i64,
    pub correct_count: i64,
    pub total_quizzes: i64,
    pub seconds_spent: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LessonCompletionResponse {
    pub score: i64,
    pub passed: bool,
    pub already_completed: bool,
    pub next_lesson_id: Option<i64>,
    pub award: XpAward,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NextLessonInfo {
    pub lesson_id: i64,
    pub title: String,
    pub jp_title: Option<String>,
    pub summary: Option<String>,
    pub duration_minutes: i64,
    pub unit_title: String,
    pub unit_jp_title: Option<String>,
    pub is_first: bool,
}

// ---------------------------------------------------------------------------
// Reading & Listening
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingQuestionSet {
    pub questions: Vec<QuizQuestion>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingPassage {
    pub id: i64,
    pub title: String,
    pub jlpt_level: String,
    pub summary: Option<String>,
    pub text_jp: String,
    pub text_translation: Option<String>,
    pub questions: Vec<QuizQuestion>,
    pub status: String,
    pub last_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingListItem {
    pub id: i64,
    pub title: String,
    pub jlpt_level: String,
    pub summary: Option<String>,
    pub completed: bool,
    pub last_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListeningDialogue {
    pub id: i64,
    pub title: String,
    pub jlpt_level: String,
    pub description: Option<String>,
    pub transcript_jp: String,
    pub transcript_translation: Option<String>,
    pub voice: String,
    pub questions: Vec<QuizQuestion>,
    pub status: String,
    pub last_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListeningListItem {
    pub id: i64,
    pub title: String,
    pub jlpt_level: String,
    pub description: Option<String>,
    pub completed: bool,
    pub last_score: Option<f64>,
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntry {
    pub id: i64,
    pub entry_date: String,
    pub text_jp: String,
    pub text_translation: Option<String>,
    pub ai_feedback: Option<String>,
    pub corrections: Vec<JournalCorrection>,
    pub word_count: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JournalCorrection {
    pub original: String,
    pub corrected: String,
    pub explanation: String,
    pub category: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JournalCorrectionResponse {
    pub entry: JournalEntry,
    pub award: XpAward,
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LifetimeStats {
    pub total_minutes: i64,
    pub total_hours: f64,
    pub active_days: i64,
    pub total_reviews: i64,
    pub total_kanji_mastered: i64,
    pub total_vocab_mastered: i64,
    pub total_journal_entries: i64,
    pub first_active_at: Option<String>,
    pub last_active_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStats {
    pub player: PlayerState,
    pub daily_missions: Vec<DailyMission>,
    pub weekly_missions: Vec<WeeklyMission>,
    pub lifetime: LifetimeStats,
    pub kanji_known: i64,
    pub kanji_due_today: i64,
    pub vocab_known: i64,
    pub vocab_due_today: i64,
    pub minutes_today: i64,
    pub minutes_goal: i64,
    pub current_level: String,
}
