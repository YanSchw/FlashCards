import { Injectable, computed, effect, signal } from '@angular/core';
import { HISTORY_SIZE, deriveState } from '../core/card-state';
import { Attempt, Card, CardState } from '../core/models';

const STORAGE_KEY = 'flashcards.v1';

type CardHistory = Record<string, Attempt[]>;

export type StateCounts = Record<CardState, number>;

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private history = signal<CardHistory>(this.load());

  // Any state-reading view can depend on this to stay reactive.
  readonly revision = computed(() => this.history());

  constructor() {
    effect(() => this.persist(this.history()));
  }

  record(cardId: string, correct: boolean, now = Date.now()): void {
    this.history.update((h) => {
      const attempts = [...(h[cardId] ?? []), { ts: now, correct }].slice(-HISTORY_SIZE);
      return { ...h, [cardId]: attempts };
    });
  }

  attemptsFor(cardId: string): Attempt[] {
    return this.history()[cardId] ?? [];
  }

  stateFor(cardId: string, now = Date.now()): CardState {
    return deriveState(this.attemptsFor(cardId), now);
  }

  countStates(cards: Card[], now = Date.now()): StateCounts {
    const counts: StateCounts = { unanswered: 0, wrong: 0, repeat: 0, memorized: 0 };
    for (const card of cards) counts[this.stateFor(card.id, now)]++;
    return counts;
  }

  reset(): void {
    this.history.set({});
  }

  private load(): CardHistory {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private persist(history: CardHistory): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* storage full or unavailable — progress simply won't persist */
    }
  }
}
