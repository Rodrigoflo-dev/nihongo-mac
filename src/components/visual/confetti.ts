import confetti from "canvas-confetti";

/** Celebrate XP / mission completion with a soft burst. */
export function burstXp() {
  confetti({
    particleCount: 60,
    spread: 75,
    startVelocity: 35,
    origin: { y: 0.65 },
    colors: ["#a78bfa", "#22d3ee", "#f472b6", "#fbbf24"],
    scalar: 0.9,
    ticks: 220,
    gravity: 1.2,
  });
}

/** Bigger, fountain-style celebration for level-up. */
export function burstLevelUp() {
  const end = Date.now() + 1200;
  const colors = ["#a78bfa", "#22d3ee", "#f472b6", "#fbbf24", "#ffffff"];
  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.85 },
      colors,
      scalar: 1.05,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.85 },
      colors,
      scalar: 1.05,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
