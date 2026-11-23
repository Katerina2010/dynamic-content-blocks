export interface Article {
  readonly id: string;
  readonly rubric: string;
  readonly title: string;
  /** Дата публикации в том виде, как на thebell.io, например "22 ноября 2026". */
  readonly dateLabel: string;
  /** Проверенная прямая ссылка на статью на thebell.io. */
  readonly url: string;
}
