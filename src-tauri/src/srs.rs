//! Modified SM-2 spaced repetition algorithm.
//!
//! Inspired by SuperMemo 2 and Anki, tuned for Japanese learning:
//! - 4 review grades (Again / Hard / Good / Easy) matching common SRS UIs.
//! - Leech detection so chronically failed items get flagged for re-learning.
//! - Fractional `interval_days` so brand-new items can re-show within minutes.
//!
//! Scheduling rules:
//! - `Again` resets the card and re-queues within ~10 minutes that day.
//! - First successful review schedules 1–4 days out, depending on grade.
//! - Subsequent reviews multiply the previous interval by ease and a grade
//!   modifier; ease is clamped to ≥ 1.3.
//! - Once the same card fails 8 times in a row it becomes a "leech".

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

pub const MIN_EASE: f64 = 1.3;
pub const STARTING_EASE: f64 = 2.5;
pub const LEECH_THRESHOLD: i64 = 8;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ReviewGrade {
    Again,
    Hard,
    Good,
    Easy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SrsState {
    pub ease_factor: f64,
    pub interval_days: f64,
    pub repetitions: i64,
    pub consecutive_failures: i64,
    pub next_review_at: DateTime<Utc>,
    pub is_leech: bool,
}

impl SrsState {
    /// State for a brand-new item that has never been studied. Due immediately.
    pub fn new_card(now: DateTime<Utc>) -> Self {
        Self {
            ease_factor: STARTING_EASE,
            interval_days: 0.0,
            repetitions: 0,
            consecutive_failures: 0,
            next_review_at: now,
            is_leech: false,
        }
    }
}

pub fn next(state: &SrsState, grade: ReviewGrade, now: DateTime<Utc>) -> SrsState {
    if matches!(grade, ReviewGrade::Again) {
        let failures = state.consecutive_failures + 1;
        return SrsState {
            ease_factor: (state.ease_factor - 0.20).max(MIN_EASE),
            interval_days: 0.01, // re-queue within session (~15 minutes)
            repetitions: 0,
            consecutive_failures: failures,
            // 10 minute relearn step before next pass
            next_review_at: now + Duration::minutes(10),
            is_leech: failures >= LEECH_THRESHOLD,
        };
    }

    let (next_interval, ease_delta) = match state.repetitions {
        0 => match grade {
            ReviewGrade::Hard => (1.0, -0.10),
            ReviewGrade::Good => (1.0, 0.0),
            ReviewGrade::Easy => (4.0, 0.15),
            ReviewGrade::Again => unreachable!(),
        },
        1 => match grade {
            ReviewGrade::Hard => (3.0, -0.10),
            ReviewGrade::Good => (6.0, 0.0),
            ReviewGrade::Easy => (10.0, 0.15),
            ReviewGrade::Again => unreachable!(),
        },
        _ => {
            let previous = state.interval_days.max(1.0);
            let modifier = match grade {
                ReviewGrade::Hard => 1.2,
                ReviewGrade::Good => state.ease_factor,
                ReviewGrade::Easy => state.ease_factor * 1.3,
                ReviewGrade::Again => unreachable!(),
            };
            let delta = match grade {
                ReviewGrade::Hard => -0.15,
                ReviewGrade::Good => 0.0,
                ReviewGrade::Easy => 0.15,
                ReviewGrade::Again => unreachable!(),
            };
            (previous * modifier, delta)
        }
    };

    let new_ease = (state.ease_factor + ease_delta).max(MIN_EASE);
    let interval = next_interval.max(0.01);
    let next_at = now + Duration::seconds((interval * 86_400.0) as i64);

    SrsState {
        ease_factor: new_ease,
        interval_days: interval,
        repetitions: state.repetitions + 1,
        consecutive_failures: 0,
        next_review_at: next_at,
        is_leech: state.is_leech, // leech flag only set on Again
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_card_is_due_immediately() {
        let now = Utc::now();
        let s = SrsState::new_card(now);
        assert_eq!(s.repetitions, 0);
        assert_eq!(s.next_review_at, now);
    }

    #[test]
    fn first_good_review_schedules_one_day() {
        let now = Utc::now();
        let s = SrsState::new_card(now);
        let n = next(&s, ReviewGrade::Good, now);
        assert_eq!(n.repetitions, 1);
        assert!((n.interval_days - 1.0).abs() < 1e-6);
    }

    #[test]
    fn again_resets_and_increments_failures() {
        let now = Utc::now();
        let s = SrsState::new_card(now);
        let n = next(&s, ReviewGrade::Again, now);
        assert_eq!(n.repetitions, 0);
        assert_eq!(n.consecutive_failures, 1);
        assert!(n.ease_factor >= MIN_EASE);
    }

    #[test]
    fn easy_after_two_correct_grows_interval() {
        let now = Utc::now();
        let s = SrsState::new_card(now);
        let s1 = next(&s, ReviewGrade::Good, now);
        let s2 = next(&s1, ReviewGrade::Easy, s1.next_review_at);
        assert!(s2.interval_days > s1.interval_days);
    }

    #[test]
    fn leech_after_threshold_failures() {
        let now = Utc::now();
        let mut s = SrsState::new_card(now);
        for _ in 0..LEECH_THRESHOLD {
            s = next(&s, ReviewGrade::Again, now);
        }
        assert!(s.is_leech);
    }
}
