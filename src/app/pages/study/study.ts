import { Component, HostListener, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Card, STATE_META } from '../../core/models';
import { weightedSample } from '../../core/shuffle';
import { CoursesService, allCards } from '../../services/courses.service';
import { ProgressService } from '../../services/progress.service';

const SWIPE = 90; // px past which a drag counts as a swipe
const TAP = 8; // px below which a pointer up counts as a tap

@Component({
  selector: 'app-study',
  template: `
    <header class="flex items-center justify-between gap-4">
      <button class="tool" (click)="quit()">‹ Dashboard</button>
      <span class="mono-label text-solder">{{ progress.currentUser() }}</span>
    </header>

    @if (done()) {
      <section class="mt-16 text-center">
        <span class="eyebrow">Session complete</span>
        <h1 class="mt-4 font-display text-4xl font-bold">Nice work.</h1>
        <div class="mt-8 flex justify-center gap-4">
          <div class="rounded-2xl border border-trace bg-board-2/70 px-7 py-5">
            <div class="font-display text-3xl font-bold text-state-memorized">{{ correct() }}</div>
            <div class="mono-label mt-1 text-back-ink/55">Got it</div>
          </div>
          <div class="rounded-2xl border border-trace bg-board-2/70 px-7 py-5">
            <div class="font-display text-3xl font-bold text-state-wrong">{{ wrong() }}</div>
            <div class="mono-label mt-1 text-back-ink/55">Missed</div>
          </div>
        </div>
        <div class="mt-9 flex justify-center gap-3">
          <button class="tool" (click)="restart()">↺ Again</button>
          <button
            class="rounded-full bg-copper px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-widest text-[#1a1109] hover:bg-copper-bright"
            (click)="quit()"
          >
            Back to dashboard
          </button>
        </div>
      </section>
    } @else if (currentCard(); as card) {
      <div class="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
        @for (i of queueIndices(); track i) {
          <div
            class="h-1.5 rounded-full transition-all"
            [class.w-6]="i === index()"
            [class.w-2]="i !== index()"
            [style.background]="i < index() ? 'var(--color-solder)' : i === index() ? 'var(--color-copper-bright)' : 'var(--color-trace)'"
          ></div>
        }
      </div>
      <p class="mono-label mt-3 text-center text-solder">
        {{ index() + 1 }} / {{ queue().length }}
      </p>

      <div class="mt-5" style="perspective: 1600px">
        <div
          class="relative mx-auto w-full max-w-[540px] cursor-grab touch-none select-none active:cursor-grabbing"
          style="aspect-ratio: 5 / 3.35; min-height: 300px"
          [style.transform]="wrapTransform()"
          [style.transition]="dragging() ? 'none' : 'transform .35s cubic-bezier(.2,.7,.2,1), opacity .3s ease'"
          [style.opacity]="leaving() ? 0 : 1"
          (pointerdown)="onDown($event)"
          (pointermove)="onMove($event)"
          (pointerup)="onUp($event)"
          (pointercancel)="onCancel()"
        >
          <!-- swipe intent overlays -->
          <div
            class="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border-2 px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest"
            style="border-color: var(--color-state-memorized); color: var(--color-state-memorized); transform: rotate(-12deg)"
            [style.opacity]="Math.max(0, Math.min(1, drag().x / SWIPE))"
          >
            Got it
          </div>
          <div
            class="pointer-events-none absolute right-4 top-4 z-10 rounded-lg border-2 px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest"
            style="border-color: var(--color-state-wrong); color: var(--color-state-wrong); transform: rotate(12deg)"
            [style.opacity]="Math.max(0, Math.min(1, -drag().x / SWIPE))"
          >
            Missed
          </div>

          <div
            class="relative h-full w-full [transform-style:preserve-3d]"
            [style.transform]="flipped() ? 'rotateY(180deg)' : 'none'"
            style="transition: transform .55s cubic-bezier(.2,.7,.2,1)"
          >
            <!-- FRONT: question / paper -->
            <div
              class="absolute inset-0 flex flex-col overflow-hidden rounded-[18px] border border-[#d8d2bf] p-6 text-ink [backface-visibility:hidden]"
              style="background: repeating-linear-gradient(0deg, transparent 0 33px, var(--color-paper-line) 33px 34px), var(--color-paper); box-shadow: 0 24px 50px -18px rgba(0,0,0,.65)"
            >
              <span
                class="absolute left-0 top-0 h-16 w-16 rounded-tl-[18px] border-l-[3px] border-t-[3px] border-copper opacity-80"
              ></span>
              <div class="flex items-center justify-between">
                <span
                  class="rounded-md border border-[rgba(200,134,47,.35)] bg-[rgba(200,134,47,.16)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a6316]"
                  >{{ card.topic }}</span
                >
                <span class="font-mono text-[11px] text-ink-soft">{{ index() + 1 }} / {{ queue().length }}</span>
              </div>
              <div class="mono-label mt-3 text-copper">Question</div>
              <div class="flex flex-1 items-center">
                <p class="font-display text-[clamp(18px,3.6vw,23px)] font-semibold leading-snug">
                  {{ card.question }}
                </p>
              </div>
              <div class="mono-label text-center text-[10px] text-ink-soft/60">▲ tap to reveal</div>
            </div>

            <!-- BACK: answer / board -->
            <div
              class="absolute inset-0 flex flex-col overflow-hidden rounded-[18px] border border-[#235244] p-6 text-back-ink [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style="background: linear-gradient(160deg,#164034 0%, var(--color-back) 60%); box-shadow: 0 24px 50px -18px rgba(0,0,0,.65)"
            >
              <span
                class="absolute bottom-0 right-0 h-16 w-16 rounded-br-[18px] border-b-[3px] border-r-[3px] border-copper opacity-80"
              ></span>
              <div class="flex items-center justify-between">
                <span
                  class="rounded-md border border-[rgba(107,179,160,.35)] bg-[rgba(107,179,160,.18)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#bfe6da]"
                  >{{ card.topic }}</span
                >
              </div>
              <div class="mono-label mt-3 text-solder">Answer</div>
              <div class="flex flex-1 items-center">
                <p
                  class="answer text-[clamp(15px,3vw,17px)] leading-relaxed"
                  [innerHTML]="card.answer"
                ></p>
              </div>
              <div class="mono-label text-center text-[10px] text-solder/70">
                swipe → got it · ← missed
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-center gap-3">
        <button
          class="tool border-[color:var(--color-state-wrong)] px-5 py-3 text-state-wrong"
          (click)="judge(false)"
        >
          ✕ Missed
        </button>
        <button
          class="rounded-full bg-copper px-7 py-3 font-mono text-[13px] font-bold uppercase tracking-widest text-[#1a1109] hover:bg-copper-bright"
          (click)="flip()"
        >
          Flip
        </button>
        <button
          class="tool border-[color:var(--color-state-memorized)] px-5 py-3 text-state-memorized"
          (click)="judge(true)"
        >
          ✓ Got it
        </button>
      </div>
      <footer class="mt-6 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#4d6459]">
        Space = flip · ← missed · → got it
      </footer>
    } @else {
      <section class="mt-20 text-center">
        <p class="text-sm text-back-ink/60">No cards available for this selection yet.</p>
        <button class="tool mt-5" (click)="quit()">‹ Back to dashboard</button>
      </section>
    }
  `,
  styles: `
    .answer :is(b, strong) {
      color: var(--color-copper-bright);
      font-weight: 600;
    }
  `,
})
export class Study {
  courseId = input.required<string>();
  scope = input<'course' | 'lecture'>('course');
  lectureId = input<string>();
  k = input(15, { transform: (v: string | number) => Number(v) || 15 });

  private coursesSvc = inject(CoursesService);
  private router = inject(Router);
  protected progress = inject(ProgressService);
  protected readonly Math = Math;
  protected readonly SWIPE = SWIPE;

  protected queue = signal<Card[]>([]);
  protected index = signal(0);
  protected flipped = signal(false);
  protected correct = signal(0);
  protected wrong = signal(0);
  protected done = signal(false);

  protected drag = signal({ x: 0, y: 0 });
  protected dragging = signal(false);
  protected leaving = signal<'left' | 'right' | null>(null);
  private start = { x: 0, y: 0 };

  protected currentCard = computed(() => this.queue()[this.index()] ?? null);
  protected queueIndices = computed(() => this.queue().map((_, i) => i));

  protected wrapTransform = computed(() => {
    if (this.leaving()) {
      const dir = this.leaving() === 'right' ? 1 : -1;
      return `translateX(${dir * 720}px) rotate(${dir * 22}deg)`;
    }
    const { x, y } = this.drag();
    return `translate(${x}px, ${y}px) rotate(${x * 0.04}deg)`;
  });

  constructor() {
    if (!this.progress.currentUser()) {
      this.router.navigate(['/']);
      return;
    }
    queueMicrotask(() =>
      this.coursesSvc.course(this.courseId()).then((course) => {
        const pool =
          this.scope() === 'lecture'
            ? (course.lectures.find((l) => l.id === this.lectureId())?.cards ?? [])
            : allCards(course);
        this.queue.set(
          weightedSample(pool, (c) => STATE_META[this.progress.stateFor(c.id)].weight, this.k()),
        );
        this.done.set(pool.length === 0);
      }),
    );
  }

  protected flip(): void {
    this.flipped.update((f) => !f);
  }

  protected judge(isCorrect: boolean): void {
    const card = this.currentCard();
    if (!card || this.leaving()) return;
    this.progress.record(card.id, isCorrect);
    (isCorrect ? this.correct : this.wrong).update((n) => n + 1);
    this.leaving.set(isCorrect ? 'right' : 'left');
    setTimeout(() => this.advance(), 300);
  }

  private advance(): void {
    this.drag.set({ x: 0, y: 0 });
    this.leaving.set(null);
    this.flipped.set(false);
    if (this.index() + 1 >= this.queue().length) this.done.set(true);
    else this.index.update((i) => i + 1);
  }

  protected restart(): void {
    this.router.navigate(['/c', this.courseId()]);
  }

  protected quit(): void {
    this.router.navigate(['/c', this.courseId()]);
  }

  // --- pointer / swipe handling ---
  protected onDown(e: PointerEvent): void {
    if (this.leaving()) return;
    this.start = { x: e.clientX, y: e.clientY };
    this.dragging.set(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  protected onMove(e: PointerEvent): void {
    if (!this.dragging()) return;
    this.drag.set({ x: e.clientX - this.start.x, y: e.clientY - this.start.y });
  }

  protected onUp(e: PointerEvent): void {
    if (!this.dragging()) return;
    this.dragging.set(false);
    const { x, y } = this.drag();
    const dist = Math.hypot(x, y);
    if (dist < TAP) {
      this.flip();
    } else if (Math.abs(x) > SWIPE && Math.abs(x) > Math.abs(y)) {
      this.judge(x > 0);
      return;
    } else if (y < -SWIPE) {
      this.flip();
    }
    this.drag.set({ x: 0, y: 0 });
  }

  protected onCancel(): void {
    this.dragging.set(false);
    this.drag.set({ x: 0, y: 0 });
  }

  @HostListener('window:keydown', ['$event'])
  protected onKey(e: KeyboardEvent): void {
    if (this.done()) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.flip();
    } else if (e.key === 'ArrowRight') {
      this.judge(true);
    } else if (e.key === 'ArrowLeft') {
      this.judge(false);
    }
  }
}
