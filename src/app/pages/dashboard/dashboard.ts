import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Course, STATE_META } from '../../core/models';
import { CoursesService, allCards } from '../../services/courses.service';
import { ProgressService } from '../../services/progress.service';
import { StateBar } from '../../ui/state-bar';

@Component({
  selector: 'app-dashboard',
  imports: [StateBar, RouterLink],
  template: `
    @if (course(); as c) {
      <header class="flex items-center gap-4">
        <a routerLink="/" class="tool">‹ Courses</a>
      </header>

      <div class="mt-6 text-center">
        <span class="eyebrow">Dashboard</span>
        <h1 class="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {{ c.title }}
        </h1>
        <p class="mt-2 text-sm text-solder">{{ c.description }}</p>
      </div>

      <section class="mt-8 rounded-2xl border border-trace bg-board-2/70 p-5 sm:p-6">
        <h2 class="mono-label mb-4 text-copper">Course progress</h2>
        <app-state-bar [counts]="courseCounts()" />
        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          @for (s of states; track s.key) {
            <div class="rounded-xl border border-trace bg-board/60 p-3 text-center">
              <div class="font-display text-2xl font-bold" [style.color]="s.color">
                {{ courseCounts()[s.key] }}
              </div>
              <div class="mono-label mt-1 text-[9.5px] text-back-ink/55">{{ s.label }}</div>
            </div>
          }
        </div>

        <div class="mt-6 flex flex-col gap-3 border-t border-trace pt-5 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2">
            <span class="mono-label text-back-ink/55">Cards</span>
            @for (k of kOptions; track k) {
              <button class="chip" [class.active]="k === deckSize()" (click)="deckSize.set(k)">
                {{ k }}
              </button>
            }
          </div>
          <button
            class="flipbtn ml-auto rounded-full bg-copper px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-widest text-[#1a1109] transition-all hover:bg-copper-bright disabled:opacity-40"
            (click)="study()"
          >
            ⤳ Study {{ pickCount(cardCount()) }} from course
          </button>
        </div>
      </section>

      <section class="mt-8">
        <h2 class="mono-label mb-3 text-copper">Lectures</h2>
        <div class="grid gap-3">
          @for (l of c.lectures; track l.id) {
            <div class="rounded-2xl border border-trace bg-board-2/70 p-4">
              <div class="flex items-start justify-between gap-3">
                <a
                  [routerLink]="['/c', courseId(), 'l', l.id]"
                  class="group -m-1 rounded-lg p-1 transition-colors hover:bg-board/50"
                >
                  <h3 class="font-display text-lg font-semibold text-back-ink group-hover:text-copper-bright">
                    {{ l.title }}
                  </h3>
                  <p class="mt-0.5 text-[13px] text-back-ink/55">{{ l.description }}</p>
                </a>
                <div class="flex shrink-0 flex-col items-end gap-2 self-center">
                  <a [routerLink]="['/c', courseId(), 'l', l.id]" class="tool">☰ Overview</a>
                  <button class="tool" (click)="studyLecture(l.id, l.cards.length)">
                    Study {{ pickCount(l.cards.length) }} ›
                  </button>
                </div>
              </div>
              <div class="mt-3">
                <app-state-bar [counts]="lectureCounts()[l.id]" [showLegend]="false" />
              </div>
            </div>
          }
        </div>
      </section>
    } @else {
      <p class="mt-20 text-center text-sm text-back-ink/50">Loading…</p>
    }
  `,
})
export class Dashboard {
  courseId = input.required<string>();

  private coursesSvc = inject(CoursesService);
  private router = inject(Router);
  protected progress = inject(ProgressService);

  protected course = signal<Course | null>(null);
  protected deckSize = signal(15);
  protected kOptions = [10, 15, 25, 50];
  protected states = (['unanswered', 'wrong', 'repeat', 'memorized'] as const).map((key) => ({
    key,
    ...STATE_META[key],
  }));

  constructor() {
    // input() is set before construction completes via component input binding.
    queueMicrotask(() => this.coursesSvc.course(this.courseId()).then((c) => this.course.set(c)));
  }

  protected cardCount(): number {
    const c = this.course();
    return c ? allCards(c).length : 0;
  }

  protected pickCount(available: number): number {
    return Math.min(this.deckSize(), available);
  }

  protected courseCounts = computed(() => {
    this.progress.revision();
    const c = this.course();
    return this.progress.countStates(c ? allCards(c) : []);
  });

  protected lectureCounts = computed(() => {
    this.progress.revision();
    const c = this.course();
    const out: Record<string, ReturnType<ProgressService['countStates']>> = {};
    for (const l of c?.lectures ?? []) out[l.id] = this.progress.countStates(l.cards);
    return out;
  });

  protected study(): void {
    this.router.navigate(['/c', this.courseId(), 'study'], {
      queryParams: { scope: 'course', k: this.deckSize() },
    });
  }

  protected studyLecture(lectureId: string, available: number): void {
    this.router.navigate(['/c', this.courseId(), 'study'], {
      queryParams: { scope: 'lecture', lectureId, k: this.deckSize() },
    });
  }
}
