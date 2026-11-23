export const TARIFF_IDS = [
  'news-monthly',
  'news-half-year',
  'news-yearly',
  'tech-trial',
  'tech-monthly',
  'tech-yearly',
  'invest-trial',
  'invest-monthly',
  'invest-half-year',
  'invest-yearly',
  'unlimited-monthly',
  'unlimited-half-year',
  'unlimited-yearly',
] as const;

export type TariffId = (typeof TARIFF_IDS)[number];

export function isTariffId(value: unknown): value is TariffId {
  return TARIFF_IDS.some((id) => id === value);
}
