import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'c/:courseId',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'c/:courseId/l/:lectureId',
    loadComponent: () => import('./pages/lecture/lecture').then((m) => m.LectureView),
  },
  {
    path: 'c/:courseId/study',
    loadComponent: () => import('./pages/study/study').then((m) => m.Study),
  },
  { path: '**', redirectTo: '' },
];
