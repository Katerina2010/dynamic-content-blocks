/**
 * Редакторские настройки блока витрины продукта.
 * `productId` — обычная строка: редакторская конфигурация проверяется во время выполнения,
 * ей не доверяют.
 */
export type ShowcaseSettings =
  { readonly mode: 'rotation' } | { readonly mode: 'pinned'; readonly productId: string };
