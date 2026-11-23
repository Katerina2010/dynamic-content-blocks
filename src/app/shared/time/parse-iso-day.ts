const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

/**
 * Разбирает `YYYY-MM-DD` в количество дней от 1970-01-01
 * или возвращает `null`, если строка не является реальной датой.
 */
export function parseIsoDay(value: string): number | null {
  const match = ISO_DAY.exec(value);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match.map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return Math.floor(utc / MS_PER_DAY);
}
