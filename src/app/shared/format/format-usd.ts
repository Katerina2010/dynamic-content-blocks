const CENTS_PER_DOLLAR = 100;

/**
 * Форматирует сумму в центах так, как checkout The Bell печатает USD: сначала знак доллара,
 * десятичная запятая, центы только если они есть, без разделителя тысяч.
 * 1490 → "$14,90", 5880 → "$58,80", 3900 → "$39", 101 → "$1,01".
 */
export function formatUsd(amountCents: number): string {
  const cents = Math.round(amountCents);
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / CENTS_PER_DOLLAR);
  const rest = absolute % CENTS_PER_DOLLAR;
  return rest === 0
    ? `${sign}$${String(dollars)}`
    : `${sign}$${String(dollars)},${String(rest).padStart(2, '0')}`;
}
