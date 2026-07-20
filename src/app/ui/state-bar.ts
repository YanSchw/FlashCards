import { Component, computed, input } from '@angular/core';
import { CARD_STATES, STATE_META } from '../core/models';
import type { StateCounts } from '../services/progress.service';

@Component({
  selector: 'app-state-bar',
  template: `
    <div class="h-2.5 w-full overflow-hidden rounded-full bg-trace/60 flex">
      @for (seg of segments(); track seg.key) {
        <div
          class="h-full transition-[width] duration-500"
          [style.width.%]="seg.pct"
          [style.background]="seg.color"
        ></div>
      }
    </div>
    @if (showLegend()) {
      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        @for (seg of segments(); track seg.key) {
          <span class="mono-label flex items-center gap-1.5 tracking-[0.12em] text-[10px]">
            <span class="h-2 w-2 rounded-full" [style.background]="seg.color"></span>
            <span class="text-back-ink/70">{{ seg.label }}</span>
            <span class="text-back-ink/90 font-bold">{{ seg.count }}</span>
          </span>
        }
      </div>
    }
  `,
})
export class StateBar {
  counts = input.required<StateCounts>();
  showLegend = input(true);

  segments = computed(() => {
    const c = this.counts();
    const total = Math.max(
      CARD_STATES.reduce((sum, k) => sum + c[k], 0),
      1,
    );
    return CARD_STATES.map((key) => ({
      key,
      label: STATE_META[key].label,
      color: STATE_META[key].color,
      count: c[key],
      pct: (c[key] / total) * 100,
    }));
  });
}
