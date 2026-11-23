import { InjectionToken } from '@angular/core';

/** Как часто статусы вебинаров пересчитываются по часам, в миллисекундах. */
export const WEBINARS_REFRESH_INTERVAL_MS = new InjectionToken<number>(
  'WEBINARS_REFRESH_INTERVAL_MS',
);
