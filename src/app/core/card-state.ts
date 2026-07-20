import { Attempt, CardState } from './models';

export const HOUR = 60 * 60 * 1000;
export const RECENT_WINDOW = 72 * HOUR;
export const MEMORIZED_WINDOW = 12 * HOUR;

// Derive a card's state from its recent attempts (see FLASH_CARD_GUIDE / README).
//   unanswered — nothing tried in the last 72h
//   wrong      — every recent try was wrong
//   repeat     — some success, but not yet locked in
//   memorized  — all recent tries correct AND the last one within 12h
export function deriveState(attempts: Attempt[], now = Date.now()): CardState {
  const recent = attempts.filter((a) => now - a.ts <= RECENT_WINDOW);
  if (recent.length === 0) return 'unanswered';

  const anyCorrect = recent.some((a) => a.correct);
  if (!anyCorrect) return 'wrong';

  const allCorrect = recent.every((a) => a.correct);
  const last = recent[recent.length - 1];
  if (allCorrect && now - last.ts <= MEMORIZED_WINDOW) return 'memorized';

  return 'repeat';
}
