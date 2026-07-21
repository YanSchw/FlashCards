import { Component, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { marked } from 'marked';
import { Lecture } from '../../core/models';
import { CoursesService } from '../../services/courses.service';

@Component({
  selector: 'app-lecture',
  imports: [RouterLink],
  template: `
    <header class="flex items-center gap-4">
      <a [routerLink]="['/c', courseId()]" class="tool">‹ Dashboard</a>
    </header>

    @if (lecture(); as l) {
      <div class="mt-6 text-center">
        <span class="eyebrow">Lecture overview</span>
        <h1 class="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {{ l.title }}
        </h1>
        <p class="mt-2 text-sm text-solder">{{ l.description }}</p>
      </div>

      <article class="markdown mt-8 rounded-2xl border border-trace bg-board-2/70 p-5 sm:p-7">
        @switch (status()) {
          @case ('ready') {
            <div [innerHTML]="html()"></div>
          }
          @case ('loading') {
            <p class="text-sm text-back-ink/50">Loading summary…</p>
          }
          @case ('missing') {
            <p class="text-sm text-back-ink/50">No summary has been added for this lecture yet.</p>
          }
        }
      </article>

      <div class="mt-8 flex justify-center">
        <button
          class="rounded-full bg-copper px-7 py-3 font-mono text-[13px] font-bold uppercase tracking-widest text-[#1a1109] hover:bg-copper-bright"
          (click)="study(l)"
        >
          ⤳ Study this lecture
        </button>
      </div>
    } @else {
      <p class="mt-20 text-center text-sm text-back-ink/50">Loading…</p>
    }
  `,
})
export class LectureView {
  courseId = input.required<string>();
  lectureId = input.required<string>();

  private coursesSvc = inject(CoursesService);
  private http = inject(HttpClient);
  private router = inject(Router);

  protected lecture = signal<Lecture | null>(null);
  protected html = signal('');
  protected status = signal<'loading' | 'ready' | 'missing'>('loading');

  constructor() {
    queueMicrotask(() =>
      this.coursesSvc.course(this.courseId()).then((course) => {
        const lecture = course.lectures.find((l) => l.id === this.lectureId()) ?? null;
        this.lecture.set(lecture);
        this.loadSummary(lecture?.summary);
      }),
    );
  }

  private async loadSummary(path?: string): Promise<void> {
    if (!path) {
      this.status.set('missing');
      return;
    }
    try {
      const md = await firstValueFrom(this.http.get(path, { responseType: 'text' }));
      this.html.set(await marked.parse(md));
      this.status.set('ready');
    } catch {
      this.status.set('missing');
    }
  }

  protected study(l: Lecture): void {
    this.router.navigate(['/c', this.courseId(), 'study'], {
      queryParams: { scope: 'lecture', lectureId: l.id, k: 15 },
    });
  }
}
