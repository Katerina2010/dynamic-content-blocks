/**
 * - `datetime`: известен момент начала (ISO 8601 со смещением).
 * - `date-only`: известен только день. Правило: вебинар считается предстоящим до конца этого
 *   календарного дня в `timeZone` и прошедшим со следующего дня.
 * `label` — дата и время в точности как опубликованы организатором.
 */
export type WebinarSchedule =
  | { readonly kind: 'datetime'; readonly startsAt: string; readonly label: string }
  | {
      readonly kind: 'date-only';
      readonly date: string;
      readonly timeZone: string;
      readonly label: string;
    };
