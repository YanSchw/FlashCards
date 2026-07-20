import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { cardId } from '../core/card-id';
import { Card, Course, CourseRef, RawCourse } from '../core/models';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private http = inject(HttpClient);
  private cache = new Map<string, Course>();
  private list?: Promise<CourseRef[]>;

  refs(): Promise<CourseRef[]> {
    this.list ??= firstValueFrom(
      this.http.get<{ courses: CourseRef[] }>('courses/index.json'),
    ).then((r) => r.courses);
    return this.list;
  }

  async summaries(): Promise<Course[]> {
    const refs = await this.refs();
    return Promise.all(refs.map((r) => this.course(r.id)));
  }

  async course(id: string): Promise<Course> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const refs = await this.refs();
    const ref = refs.find((r) => r.id === id);
    if (!ref) throw new Error(`Unknown course: ${id}`);

    const raw = await firstValueFrom(this.http.get<RawCourse>(`courses/${ref.file}`));
    const hydrated = this.hydrate(raw);
    this.cache.set(id, hydrated);
    return hydrated;
  }

  private hydrate(raw: RawCourse): Course {
    return {
      ...raw,
      lectures: raw.lectures.map((lecture) => ({
        ...lecture,
        cards: lecture.cards.map(
          (c): Card => ({
            ...c,
            id: cardId(c.topic, c.question, c.answer),
            courseId: raw.id,
            lectureId: lecture.id,
          }),
        ),
      })),
    };
  }
}

export function allCards(course: Course): Card[] {
  return course.lectures.flatMap((l) => l.cards);
}
