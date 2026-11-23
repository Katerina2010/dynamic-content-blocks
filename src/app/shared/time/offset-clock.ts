import { Observable, defer, interval, map, startWith } from 'rxjs';
import { Clock } from './clock.interface';

/**
 * Часы реального времени, сдвинутые на постоянное смещение. Смещение 0 — обычные системные
 * часы; ненулевое смещение позволяет демо начаться «в» другой момент, а время продолжает идти.
 */
export class OffsetClock implements Clock {
  constructor(private readonly offsetMs = 0) {}

  now(): Date {
    return new Date(Date.now() + this.offsetMs);
  }

  ticks(periodMs: number): Observable<Date> {
    return defer(() =>
      interval(periodMs).pipe(
        map(() => this.now()),
        startWith(this.now()),
      ),
    );
  }
}
