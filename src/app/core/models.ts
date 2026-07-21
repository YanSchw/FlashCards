export interface RawCard {
  topic: string;
  question: string;
  answer: string;
}

export interface RawLecture {
  id: string;
  title: string;
  description?: string;
  summary?: string; // path (relative to public root) to a Markdown overview
  cards: RawCard[];
}

export interface RawCourse {
  id: string;
  title: string;
  description?: string;
  lectures: RawLecture[];
}

export interface CourseRef {
  id: string;
  file: string;
}

export interface Card extends RawCard {
  id: string;
  courseId: string;
  lectureId: string;
}

export interface Lecture extends RawLecture {
  cards: Card[];
}

export interface Course extends RawCourse {
  lectures: Lecture[];
}

export type CardState = 'unanswered' | 'wrong' | 'repeat' | 'memorized';

export interface Attempt {
  ts: number;
  correct: boolean;
}

export const CARD_STATES: CardState[] = ['unanswered', 'wrong', 'repeat', 'memorized'];

export const STATE_META: Record<
  CardState,
  { label: string; color: string; weight: number }
> = {
  unanswered: { label: 'Unanswered', color: 'var(--color-state-unanswered)', weight: 3.0 },
  wrong: { label: 'Wrong', color: 'var(--color-state-wrong)', weight: 2.0 },
  repeat: { label: 'Needs Repetition', color: 'var(--color-state-repeat)', weight: 1.0 },
  memorized: { label: 'Memorized', color: 'var(--color-state-memorized)', weight: 0.1 },
};
