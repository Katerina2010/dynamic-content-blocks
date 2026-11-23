/**
 * Одно право, которое даёт тариф. Доступ всегда проверяется по правам (entitlements),
 * никогда по продуктам.
 */
export type EntitlementId =
  | 'news.newsletters'
  | 'tech.newsletter'
  | 'tech.archive'
  | 'tech.webinars'
  | 'invest.newsletter'
  | 'invest.archive'
  | 'invest.webinars';
