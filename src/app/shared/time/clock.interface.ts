import { Observable } from 'rxjs';

/**
 * Источник текущего момента. Изолирует системное время,
 * чтобы правила оставались детерминированными в тестах.
 */
export interface Clock {
  now(): Date;
  /** Сразу выдаёт текущий момент, а затем — каждые `periodMs`. */
  ticks(periodMs: number): Observable<Date>;
}
