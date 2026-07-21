import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogHost } from './ui/dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DialogHost],
  template: `
    <main class="relative z-[1] mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-16 pt-7 sm:px-6">
      <router-outlet />
    </main>
    <app-dialog-host />
  `,
})
export class App {}
