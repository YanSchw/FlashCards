import { Injectable, computed, effect, signal } from '@angular/core';
import { deriveState } from '../core/card-state';
import { Attempt, Card, CardState } from '../core/models';

const STORAGE_KEY = 'flashcards.v1';
const MAX_ATTEMPTS = 3; // last N tries kept per card

type CardHistory = Record<string, Attempt[]>;

interface Store {
  users: string[];
  currentUser: string | null;
  progress: Record<string, CardHistory>;
}

const EMPTY: Store = { users: [], currentUser: null, progress: {} };

export type StateCounts = Record<CardState, number>;

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private store = signal<Store>(this.load());

  readonly users = computed(() => this.store().users);
  readonly currentUser = computed(() => this.store().currentUser);

  constructor() {
    effect(() => this.persist(this.store()));
  }

  addUser(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.store.update((s) => {
      const users = s.users.includes(trimmed) ? s.users : [...s.users, trimmed];
      return { ...s, users, currentUser: trimmed, progress: { ...s.progress, [trimmed]: s.progress[trimmed] ?? {} } };
    });
  }

  selectUser(name: string | null): void {
    this.store.update((s) => ({ ...s, currentUser: name }));
  }

  removeUser(name: string): void {
    this.store.update((s) => {
      const { [name]: _removed, ...progress } = s.progress;
      const users = s.users.filter((u) => u !== name);
      const currentUser = s.currentUser === name ? (users[0] ?? null) : s.currentUser;
      return { users, currentUser, progress };
    });
  }

  record(cardId: string, correct: boolean, now = Date.now()): void {
    const user = this.store().currentUser;
    if (!user) return;
    this.store.update((s) => {
      const history = s.progress[user] ?? {};
      const attempts = [...(history[cardId] ?? []), { ts: now, correct }].slice(-MAX_ATTEMPTS);
      return { ...s, progress: { ...s.progress, [user]: { ...history, [cardId]: attempts } } };
    });
  }

  attemptsFor(cardId: string): Attempt[] {
    const user = this.store().currentUser;
    if (!user) return [];
    return this.store().progress[user]?.[cardId] ?? [];
  }

  stateFor(cardId: string, now = Date.now()): CardState {
    return deriveState(this.attemptsFor(cardId), now);
  }

  countStates(cards: Card[], now = Date.now()): StateCounts {
    const counts: StateCounts = { unanswered: 0, wrong: 0, repeat: 0, memorized: 0 };
    for (const card of cards) counts[this.stateFor(card.id, now)]++;
    return counts;
  }

  // A stable signal that any state-reading view can depend on to stay reactive.
  readonly revision = computed(() => this.store().progress);

  private load(): Store {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(EMPTY);
      return { ...structuredClone(EMPTY), ...JSON.parse(raw) };
    } catch {
      return structuredClone(EMPTY);
    }
  }

  private persist(store: Store): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* storage full or unavailable — progress simply won't persist */
    }
  }
}
