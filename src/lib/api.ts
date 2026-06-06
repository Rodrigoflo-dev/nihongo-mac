import { invoke } from "@tauri-apps/api/core";

// ---------------------------------------------------------------------------
// Shared types — mirror src-tauri/src/models.rs (camelCase via serde)
// ---------------------------------------------------------------------------
export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

// Local login (username + PIN, gates the single profile)
export interface AuthStatus {
  hasCredential: boolean;
  username: string | null;
}

export interface UserProfile {
  id: number;
  name: string;
  targetLevel: JlptLevel;
  currentLevel: JlptLevel;
  knowsHiragana: boolean;
  knowsKatakana: boolean;
  dailyMinutesGoal: number;
  reminderTime: string | null;
  locale: string;
  onboardedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileInput {
  name?: string;
  targetLevel?: JlptLevel;
  currentLevel?: JlptLevel;
  knowsHiragana?: boolean;
  knowsKatakana?: boolean;
  dailyMinutesGoal?: number;
  reminderTime?: string | null;
  locale?: string;
}

export interface CompleteOnboardingInput {
  name: string;
  currentLevel: JlptLevel;
  targetLevel: JlptLevel;
  knowsHiragana: boolean;
  knowsKatakana: boolean;
  dailyMinutesGoal: number;
  reminderTime?: string | null;
}

// Player & progression
export interface PlayerState {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPct: number;
  stars: number;
  title: string;
  titleJp: string;
  restDaysAvailable: number;
  restDayActiveToday: boolean;
  doubleXpUntil: string | null;
  doubleXpActive: boolean;
  lastLevelUpAt: string | null;
}

export interface DailyMission {
  id: number;
  kind: string;
  title: string;
  description: string;
  targetValue: number;
  progress: number;
  xpReward: number;
  starReward: number;
  completed: boolean;
  completedAt: string | null;
}

export interface WeeklyMission extends Omit<DailyMission, "id"> {
  id: number;
  weekStart: string;
}

export interface XpAward {
  xpAmount: number;
  starAmount: number;
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  completedDaily: DailyMission[];
  completedWeekly: WeeklyMission[];
}

// Rewards
export interface Reward {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string | null;
  cost: number;
  kind: string;
  ownedQuantity: number;
}

export interface RewardPurchaseResult {
  success: boolean;
  starsRemaining: number;
  reward: Reward;
}

// Kanji
export interface KanjiExample {
  jp: string;
  reading: string;
  meaning: string;
}

export interface Kanji {
  id: number;
  character: string;
  meaningEs: string;
  meaningEn: string | null;
  onyomi: string[];
  kunyomi: string[];
  jlptLevel: JlptLevel;
  grade: number | null;
  strokeCount: number | null;
  examples: KanjiExample[];
  mnemonic: string | null;
}

export type KanjiStatus = "new" | "learning" | "mastered" | "leech";

export interface KanjiListItem {
  kanji: Kanji;
  status: KanjiStatus;
  repetitions: number;
  nextReviewAt: string | null;
}

export interface KanjiSrs {
  kanji: Kanji;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  consecutiveFailures: number;
  isLeech: boolean;
  totalReviews: number;
  totalCorrect: number;
  status: KanjiStatus;
}

export interface ReviewQueue {
  due: KanjiSrs[];
  newAvailable: number;
}

export interface ReviewResult {
  srs: KanjiSrs;
  award: XpAward;
}

export type ReviewGrade = "again" | "hard" | "good" | "easy";

// ---------------------------------------------------------------------------
// Lessons (guided e-learning)
// ---------------------------------------------------------------------------

export interface LessonExample {
  jp: string;
  reading: string;
  meaning: string;
}

export type LessonStatus = "available" | "in_progress" | "completed" | "locked";

export type Activity =
  | {
      id: string;
      kind: "intro_kanji";
      kanjiChar: string;
      meaning: string;
      onyomi: string[];
      kunyomi: string[];
      example?: LessonExample | null;
      note?: string | null;
    }
  | {
      id: string;
      kind: "intro_vocab";
      word: string;
      reading: string;
      meaning: string;
      example?: string | null;
    }
  | {
      id: string;
      kind: "intro_grammar";
      title: string;
      pattern: string;
      explanation: string;
      example: LessonExample;
    }
  | {
      id: string;
      kind: "quiz";
      prompt: string;
      promptJp?: string | null;
      options: string[];
      correctIndex: number;
      explanation?: string | null;
    }
  | {
      id: string;
      kind: "listening";
      textJp: string;
      voice: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation?: string | null;
    }
  | {
      id: string;
      kind: "speaking";
      textJp: string;
      reading: string;
      meaning: string;
      voice: string;
    }
  | {
      id: string;
      kind: "write_kanji";
      kanjiChar: string;
      meaning: string;
      reading: string;
      note?: string | null;
    }
  | {
      id: string;
      kind: "write_sentence";
      prompt: string;
      hint?: string | null;
      accepted: string[];
      explanation: string;
    }
  | {
      id: string;
      kind: "summary";
      learned: string[];
    };

export interface LessonSummary {
  id: number;
  unitId: number;
  title: string;
  jpTitle: string | null;
  summary: string | null;
  durationMinutes: number;
  ordering: number;
  status: LessonStatus;
  score: number | null;
  bestScore: number | null;
  completions: number;
  activityCount: number;
}

export interface Unit {
  id: number;
  title: string;
  description: string | null;
  jpTitle: string | null;
  ordering: number;
  lessons: LessonSummary[];
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  jlptLevel: JlptLevel;
  jpTitle: string | null;
  units: Unit[];
}

export interface Lesson {
  id: number;
  unitId: number;
  title: string;
  jpTitle: string | null;
  summary: string | null;
  durationMinutes: number;
  ordering: number;
  status: LessonStatus;
  activities: Activity[];
}

export interface LessonResult {
  lessonId: number;
  correctCount: number;
  totalQuizzes: number;
  secondsSpent: number;
}

export interface LessonCompletionResponse {
  score: number;
  passed: boolean;
  alreadyCompleted: boolean;
  nextLessonId: number | null;
  award: XpAward;
}

export interface NextLessonInfo {
  lessonId: number;
  title: string;
  jpTitle: string | null;
  summary: string | null;
  durationMinutes: number;
  unitTitle: string;
  unitJpTitle: string | null;
  isFirst: boolean;
}

// Unit exam
export interface UnitExam {
  unitId: number;
  unitTitle: string;
  unitJpTitle: string | null;
  activities: Activity[];
  allLessonsComplete: boolean;
  bestScore: number | null;
  lastScore: number | null;
  completions: number;
}

export interface UnitExamResult {
  score: number;
  passed: boolean;
  previousBest: number | null;
  newBest: boolean;
  award: XpAward;
}

// Mini-games
export interface MinigameResult {
  score: number;
  bestScore: number;
  newBest: boolean;
  award: XpAward;
}

// Grammar
export interface GrammarExample {
  jp: string;
  reading: string;
  meaning: string;
}

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  promptJp: string | null;
  options: QuizOption[];
}

export type GrammarStatus = "new" | "learning" | "mastered";

export interface GrammarListItem {
  id: number;
  title: string;
  jlptLevel: JlptLevel;
  category: string | null;
  structure: string | null;
  status: GrammarStatus;
  confidence: number;
  ordering: number;
}

export interface GrammarLesson {
  id: number;
  title: string;
  jlptLevel: JlptLevel;
  category: string | null;
  explanationMd: string;
  structure: string | null;
  examples: GrammarExample[];
  quiz: QuizQuestion[];
  difficulty: number;
  ordering: number;
  status: GrammarStatus;
  confidence: number;
  lastQuizScore: number | null;
}

export interface QuizSubmission {
  answers: { questionId: string; optionIndex: number }[];
}

export interface GrammarQuizResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  award: XpAward;
}

// Reading
export interface ReadingListItem {
  id: number;
  title: string;
  jlptLevel: JlptLevel;
  summary: string | null;
  completed: boolean;
  lastScore: number | null;
}

export interface ReadingPassage {
  id: number;
  title: string;
  jlptLevel: JlptLevel;
  summary: string | null;
  textJp: string;
  textTranslation: string | null;
  questions: QuizQuestion[];
  status: string;
  lastScore: number | null;
}

// Listening
export interface ListeningListItem {
  id: number;
  title: string;
  jlptLevel: JlptLevel;
  description: string | null;
  completed: boolean;
  lastScore: number | null;
}

export interface ListeningDialogue {
  id: number;
  title: string;
  jlptLevel: JlptLevel;
  description: string | null;
  transcriptJp: string;
  transcriptTranslation: string | null;
  voice: string;
  questions: QuizQuestion[];
  status: string;
  lastScore: number | null;
}

// Journal
export interface JournalCorrection {
  original: string;
  corrected: string;
  explanation: string;
  category: string | null;
}

export interface JournalEntry {
  id: number;
  entryDate: string;
  textJp: string;
  textTranslation: string | null;
  aiFeedback: string | null;
  corrections: JournalCorrection[];
  wordCount: number;
  createdAt: string;
}

export interface JournalCorrectionResponse {
  entry: JournalEntry;
  award: XpAward;
}

// Activity heatmap
export interface DayActivity {
  date: string;
  minutes: number;
  activities: number;
}

// Achievements
export interface UnlockedAchievement {
  id: number;
  key: string;
  title: string;
  description: string | null;
  tier: string | null;
  icon: string | null;
  unlocked: boolean;
  progress: number;
  target: number;
}

// Guidance — next-best-action recommendation
export interface NextAction {
  key: string;
  title: string;
  subtitle: string;
  jpSubtitle: string;
  ctaLabel: string;
  modulePath: string;
  icon: string;
  urgency: "high" | "medium" | "low";
  estimatedMinutes: number;
  kanjiHint: string;
}

// Dashboard
export interface LifetimeStats {
  totalMinutes: number;
  totalHours: number;
  activeDays: number;
  totalReviews: number;
  totalKanjiMastered: number;
  totalVocabMastered: number;
  totalJournalEntries: number;
  firstActiveAt: string | null;
  lastActiveAt: string | null;
}

export interface DashboardStats {
  player: PlayerState;
  dailyMissions: DailyMission[];
  weeklyMissions: WeeklyMission[];
  lifetime: LifetimeStats;
  kanjiKnown: number;
  kanjiDueToday: number;
  vocabKnown: number;
  vocabDueToday: number;
  minutesToday: number;
  minutesGoal: number;
  currentLevel: JlptLevel;
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------
export const api = {
  appVersion: () => invoke<string>("app_version"),
  dbHealth: () => invoke<number>("db_health"),

  // Auth (local login)
  authStatus: () => invoke<AuthStatus>("auth_status"),
  setCredentials: (username: string, pin: string) =>
    invoke<AuthStatus>("set_credentials", { username, pin }),
  verifyPin: (pin: string) => invoke<boolean>("verify_pin", { pin }),

  // User
  getUserProfile: () => invoke<UserProfile>("get_user_profile"),
  updateUserProfile: (input: UpdateUserProfileInput) =>
    invoke<UserProfile>("update_user_profile", { input }),
  completeOnboarding: (input: CompleteOnboardingInput) =>
    invoke<UserProfile>("complete_onboarding", { input }),

  // Dashboard
  getDashboardStats: () => invoke<DashboardStats>("get_dashboard_stats"),
  getLifetimeStats: () => invoke<LifetimeStats>("get_lifetime_stats"),

  // Guidance
  getNextAction: () => invoke<NextAction>("get_next_action"),

  // Activity / achievements
  getActivityHeatmap: (days?: number) =>
    invoke<DayActivity[]>("get_activity_heatmap", { days: days ?? null }),
  getAchievements: () => invoke<UnlockedAchievement[]>("get_achievements"),

  // Notifications (sending is done in the frontend via the notification plugin)
  checkReminderDue: () => invoke<string | null>("check_reminder_due"),
  openMicSettings: () => invoke<void>("open_mic_settings"),

  // Player & missions
  getPlayerState: () => invoke<PlayerState>("get_player_state"),
  getDailyMissions: () => invoke<DailyMission[]>("get_daily_missions"),
  getWeeklyMissions: () => invoke<WeeklyMission[]>("get_weekly_missions"),

  // Rewards
  listRewards: () => invoke<Reward[]>("list_rewards"),
  purchaseReward: (rewardId: number) =>
    invoke<RewardPurchaseResult>("purchase_reward", { rewardId }),
  activateDoubleXp: () => invoke<PlayerState>("activate_double_xp"),
  claimRestDay: () => invoke<PlayerState>("claim_rest_day"),

  // Kanji
  listKanji: (level: JlptLevel) =>
    invoke<KanjiListItem[]>("list_kanji", { level }),
  getReviewQueue: (level: JlptLevel) =>
    invoke<ReviewQueue>("get_review_queue", { level }),
  introduceKanji: (kanjiId: number) =>
    invoke<ReviewResult>("introduce_kanji", { kanjiId }),
  reviewKanji: (kanjiId: number, grade: ReviewGrade, durationSeconds?: number) =>
    invoke<ReviewResult>("review_kanji", {
      kanjiId,
      grade,
      durationSeconds: durationSeconds ?? null,
    }),

  // Grammar
  listGrammar: (level: JlptLevel) =>
    invoke<GrammarListItem[]>("list_grammar", { level }),
  getGrammarLesson: (lessonId: number) =>
    invoke<GrammarLesson>("get_grammar_lesson", { lessonId }),
  startGrammarLesson: (lessonId: number) =>
    invoke<GrammarLesson>("start_grammar_lesson", { lessonId }),
  submitGrammarQuiz: (lessonId: number, submission: QuizSubmission) =>
    invoke<GrammarQuizResult>("submit_grammar_quiz", { lessonId, submission }),

  // Reading
  listReading: (level: JlptLevel) =>
    invoke<ReadingListItem[]>("list_reading", { level }),
  getReadingPassage: (passageId: number) =>
    invoke<ReadingPassage>("get_reading_passage", { passageId }),
  completeReadingPassage: (
    passageId: number,
    submission: QuizSubmission
  ) =>
    invoke<XpAward>("complete_reading_passage", {
      passageId,
      submission,
    }),

  // Listening
  listListening: (level: JlptLevel) =>
    invoke<ListeningListItem[]>("list_listening", { level }),
  getListeningDialogue: (dialogueId: number) =>
    invoke<ListeningDialogue>("get_listening_dialogue", { dialogueId }),
  completeListeningDialogue: (
    dialogueId: number,
    submission: { answers: { questionId: string; optionIndex: number }[]; durationSeconds?: number }
  ) =>
    invoke<XpAward>("complete_listening_dialogue", {
      dialogueId,
      submission,
    }),

  // Journal
  listJournal: (limit?: number) =>
    invoke<JournalEntry[]>("list_journal", { limit: limit ?? null }),
  createJournalEntry: (textJp: string) =>
    invoke<JournalCorrectionResponse>("create_journal_entry", { textJp }),
  deleteJournalEntry: (entryId: number) =>
    invoke<void>("delete_journal_entry", { entryId }),

  // Lessons (guided e-learning)
  listCourses: () => invoke<Course[]>("list_courses"),
  getLesson: (lessonId: number) => invoke<Lesson>("get_lesson", { lessonId }),
  startLesson: (lessonId: number) =>
    invoke<Lesson>("start_lesson", { lessonId }),
  completeLesson: (result: LessonResult) =>
    invoke<LessonCompletionResponse>("complete_lesson", { result }),
  getNextLesson: () => invoke<NextLessonInfo | null>("get_next_lesson"),

  // Unit exams
  getUnitExam: (unitId: number) => invoke<UnitExam>("get_unit_exam", { unitId }),
  completeUnitExam: (unitId: number, result: LessonResult) =>
    invoke<UnitExamResult>("complete_unit_exam", { unitId, result }),

  // Mini-games
  recordMinigameScore: (
    gameKey: string,
    score: number,
    durationSeconds?: number
  ) =>
    invoke<MinigameResult>("record_minigame_score", {
      gameKey,
      score,
      durationSeconds: durationSeconds ?? null,
    }),
  getMinigameBest: (gameKey: string) =>
    invoke<number>("get_minigame_best", { gameKey }),
};
