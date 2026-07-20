import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '../../core/models';
import { CoursesService, allCards } from '../../services/courses.service';
import { ProgressService } from '../../services/progress.service';
import { StateBar } from '../../ui/state-bar';

@Component({
  selector: 'app-home',
  imports: [StateBar, RouterLink],
  template: `
    <header class="text-center">
      <span class="eyebrow">Flashcards</span>
      <h1 class="mt-3 font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl">
        Study Deck
      </h1>
      <p class="mt-2 text-sm text-solder">Choose a course to study.</p>
    </header>

    <section class="mt-10 grid gap-4">
      @for (c of courses(); track c.id) {
        <a
          class="group rounded-2xl border border-trace bg-board-2/70 p-5 text-left transition-all hover:border-copper hover:bg-board-2"
          [routerLink]="['/c', c.id]"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-display text-xl font-semibold text-back-ink">{{ c.title }}</h3>
              <p class="mt-1 text-sm text-back-ink/60">{{ c.description }}</p>
            </div>
            <span class="mono-label shrink-0 rounded-md border border-trace px-2 py-1 text-[10px] text-solder">
              {{ c.lectures.length }} lec · {{ cardCount(c) }} cards
            </span>
          </div>
          <div class="mt-4">
            <app-state-bar [counts]="countsFor(c)" />
          </div>
        </a>
      } @empty {
        <p class="text-center text-sm text-back-ink/50">Loading courses…</p>
      }
    </section>
  `,
})
export class Home {
  private coursesSvc = inject(CoursesService);
  private progress = inject(ProgressService);

  protected courses = signal<Course[]>([]);

  constructor() {
    this.coursesSvc.summaries().then((cs) => this.courses.set(cs));
  }

  protected cardCount(c: Course): number {
    return allCards(c).length;
  }

  protected countsFor(c: Course) {
    this.progress.revision(); // reactive dependency
    return this.progress.countStates(allCards(c));
  }
}
