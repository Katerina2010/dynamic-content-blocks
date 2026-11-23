/**
 * Редакторские настройки блока вебинаров.
 * - `upcoming-then-recent`: сначала ближайшие предстоящие, затем самые недавние прошедшие;
 *   необязательный фильтр по серии.
 * - `manual`: ровно эти вебинары в этом порядке (неизвестные id пропускаются).
 * Id — обычные строки, потому что редакторская конфигурация проверяется во время выполнения.
 */
export type WebinarsShowcaseSettings =
  | {
      readonly rule: 'upcoming-then-recent';
      readonly limit: number;
      readonly series?: readonly string[];
    }
  | { readonly rule: 'manual'; readonly webinarIds: readonly string[] };
