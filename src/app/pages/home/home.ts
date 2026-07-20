import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Course } from '../../core/models';
import { CoursesService, allCards } from '../../services/courses.service';
import { ProgressService } from '../../services/progress.service';
import { StateBar } from '../../ui/state-bar';

@Component({
  selector: 'app-home',
  imports: [StateBar],
  template: `
    <header class="text-center">
      <span class="eyebrow">Flashcards</span>
      <h1 class="mt-3 font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl">
        Study Deck
      </h1>
      <p class="mt-2 text-sm text-solder">Pick who's studying, then choose a course.</p>
    </header>

    <section class="mt-9">
      <h2 class="mono-label mb-3 text-copper">Who's studying?</h2>
      <div class="flex flex-wrap items-center gap-2">
        @for (u of progress.users(); track u) {
          <button
            class="chip"
            [class.active]="u === progress.currentUser()"
            (click)="progress.selectUser(u)"
          >
            {{ u }}
          </button>
        }
        <form class="flex items-center gap-2" (submit)="add($event)">
          <input
            #nameInput
            class="w-36 rounded-full border border-trace bg-board-2 px-3.5 py-[7px] font-mono text-[11.5px] text-back-ink outline-none placeholder:text-back-ink/30 focus:border-copper"
            placeholder="+ add profile"
            aria-label="New profile name"
          />
          <button class="tool" type="submit">Add</button>
        </form>
        @if (progress.currentUser(); as cur) {
          <button
            class="tool ml-auto"
            (click)="progress.removeUser(cur)"
            title="Remove this profile and its progress"
          >
            ✕ Remove {{ cur }}
          </button>
        }
      </div>
    </section>

    <section class="mt-10 grid gap-4">
      @for (c of courses(); track c.id) {
        <button
          class="group rounded-2xl border border-trace bg-board-2/70 p-5 text-left transition-all hover:border-copper hover:bg-board-2 disabled:cursor-not-allowed disabled:opacity-45"
          [disabled]="!progress.currentUser()"
          (click)="open(c)"
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
          @if (progress.currentUser()) {
            <div class="mt-4">
              <app-state-bar [counts]="countsFor(c)" />
            </div>
          }
        </button>
      } @empty {
        <p class="text-center text-sm text-back-ink/50">Loading courses…</p>
      }
      @if (!progress.currentUser() && courses().length) {
        <p class="text-center font-mono text-[11px] tracking-wider text-copper-bright">
          Add or select a profile above to start.
        </p>
      }
    </section>
  `,
})
export class Home {
  private coursesSvc = inject(CoursesService);
  private router = inject(Router);
  protected progress = inject(ProgressService);

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

  protected add(event: Event): void {
    event.preventDefault();
    const input = (event.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    this.progress.addUser(input.value);
    input.value = '';
  }

  protected open(c: Course): void {
    if (!this.progress.currentUser()) return;
    this.router.navigate(['/c', c.id]);
  }
}
