import { DOCUMENT, Provider } from '@angular/core';
import { CLOCK } from './clock.token';
import { OffsetClock } from './offset-clock';

export const DEMO_NOW_PARAM = 'demoNow';

/**
 * Связывает `CLOCK` с системными часами. Для демо и проверок в браузере
 * `?demoNow=<ISO instant>` запускает часы с этого момента (они продолжают идти),
 * например чтобы показать ротацию в полночь.
 */
export function provideClock(): Provider {
  return {
    provide: CLOCK,
    deps: [DOCUMENT],
    useFactory: (document: Document): OffsetClock => {
      const requested = new URLSearchParams(document.location.search).get(DEMO_NOW_PARAM);
      const target = requested === null ? Number.NaN : Date.parse(requested);
      return new OffsetClock(Number.isNaN(target) ? 0 : target - Date.now());
    },
  };
}
