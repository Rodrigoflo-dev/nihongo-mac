import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/app-layout";
import { LockGate } from "@/components/layout/lock-gate";
import { OnboardingGate } from "@/components/layout/onboarding-gate";
import DashboardPage from "@/pages/dashboard";
import GrammarPage from "@/pages/grammar";
import GrammarLessonPage from "@/pages/grammar-lesson";
import JournalPage from "@/pages/journal";
import KanjiPage from "@/pages/kanji";
import KanjiReviewPage from "@/pages/kanji-review";
import ExamPage from "@/pages/exam";
import HiraganaSpeedGame from "@/pages/minigame-hiragana-speed";
import KanjiMatchGame from "@/pages/minigame-kanji-match";
import KanjiQuizGame from "@/pages/minigame-kanji-quiz";
import LearnPage from "@/pages/learn";
import LessonPlayer from "@/pages/lesson-player";
import ReviewLessonsPage from "@/pages/review-lessons";
import PlayPage from "@/pages/play";
import ListeningPage from "@/pages/listening";
import OnboardingPage from "@/pages/onboarding";
import ReadingPage from "@/pages/reading";
import RewardsPage from "@/pages/rewards";
import SettingsPage from "@/pages/settings";
import SpeakingPage from "@/pages/speaking";
import StatsPage from "@/pages/stats";

function App() {
  return (
    <BrowserRouter>
      <LockGate>
      <OnboardingGate>
        <Routes>
          <Route path="/welcome" element={<OnboardingPage />} />
          <Route path="/learn/:id" element={<LessonPlayer />} />
          <Route path="/exam/:unitId" element={<ExamPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/repaso" element={<ReviewLessonsPage />} />
            <Route path="/kanji" element={<KanjiPage />} />
            <Route path="/kanji/review" element={<KanjiReviewPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/grammar/:id" element={<GrammarLessonPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="/speaking" element={<SpeakingPage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/play/kanji-match" element={<KanjiMatchGame />} />
            <Route path="/play/hiragana-speed" element={<HiraganaSpeedGame />} />
            <Route path="/play/kanji-quiz" element={<KanjiQuizGame />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OnboardingGate>
      </LockGate>
    </BrowserRouter>
  );
}

export default App;
