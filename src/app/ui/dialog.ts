import {
  Component,
  ElementRef,
  Injectable,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

export interface DialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' paints the confirm button red — use for destructive actions. */
  tone?: 'default' | 'danger';
}

/** An open request: options plus the resolver waiting on the answer. */
interface OpenDialog extends Required<Omit<DialogOptions, 'message'>> {
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private request = signal<OpenDialog | null>(null);
  private pending: ((result: boolean) => void) | null = null;

  /** The dialog currently asking for an answer, if any. Read by the host. */
  readonly current = this.request.asReadonly();

  /** Resolves true if the user confirms, false on cancel / Esc / backdrop. */
  confirm(options: DialogOptions): Promise<boolean> {
    this.resolve(false); // a second ask supersedes whatever was open
    return new Promise<boolean>((resolve) => {
      this.pending = resolve;
      this.request.set({
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        tone: 'default',
        ...options,
      });
    });
  }

  /** Single-button notice. Resolves once acknowledged. */
  async alert(options: Omit<DialogOptions, 'cancelLabel'>): Promise<void> {
    await this.confirm({ confirmLabel: 'OK', ...options, cancelLabel: '' });
  }

  /** Closes the open dialog with `result`; a no-op when nothing is pending. */
  resolve(result: boolean): void {
    const pending = this.pending;
    this.pending = null;
    this.request.set(null);
    pending?.(result);
  }
}

@Component({
  selector: 'app-dialog-host',
  template: `
    <dialog
      #dlg
      class="dialog w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-trace bg-board-2 p-0 text-back-ink"
      (close)="dialog.resolve(false)"
      (click)="onBackdropClick($event)"
    >
      @if (dialog.current(); as d) {
        <div class="p-6">
          <h2 class="font-display text-xl font-bold leading-tight">{{ d.title }}</h2>
          @if (d.message) {
            <p class="mt-3 text-sm leading-relaxed text-back-ink/65">{{ d.message }}</p>
          }
          <div class="mt-7 flex justify-end gap-3">
            @if (d.cancelLabel) {
              <button class="tool" (click)="dialog.resolve(false)">{{ d.cancelLabel }}</button>
            }
            <button
              class="rounded-full px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-widest"
              [class]="
                d.tone === 'danger'
                  ? 'bg-state-wrong text-[#2a0f0d] hover:brightness-110'
                  : 'bg-copper text-[#1a1109] hover:bg-copper-bright'
              "
              autofocus
              (click)="dialog.resolve(true)"
            >
              {{ d.confirmLabel }}
            </button>
          </div>
        </div>
      }
    </dialog>
  `,
})
export class DialogHost {
  protected dialog = inject(DialogService);
  private dlg = viewChild<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    // Drive the native element from the service's signal. showModal() is what
    // gives us the focus trap, Esc-to-close and inert background for free.
    effect(() => {
      const open = this.dialog.current() !== null;
      const el = this.dlg()?.nativeElement;
      if (!el) return;
      if (open && !el.open) el.showModal();
      else if (!open && el.open) el.close();
    });
  }

  /** Clicks land on the dialog itself only when they hit the backdrop. */
  protected onBackdropClick(e: MouseEvent): void {
    if (e.target === this.dlg()?.nativeElement) this.dialog.resolve(false);
  }
}
