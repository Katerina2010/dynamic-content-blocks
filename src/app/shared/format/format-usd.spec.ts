import { TARIFFS } from '../../modules/products/data/sources/tariffs.data';
import { formatUsd } from './format-usd';

describe('formatUsd: формат цен в USD', () => {
  it('использует десятичную запятую, как официальный checkout, и отбрасывает нулевые центы', () => {
    expect(formatUsd(1490)).toBe('$14,90');
    expect(formatUsd(980)).toBe('$9,80');
    expect(formatUsd(5880)).toBe('$58,80');
    expect(formatUsd(101)).toBe('$1,01');
    expect(formatUsd(105)).toBe('$1,05');
    expect(formatUsd(100)).toBe('$1');
    expect(formatUsd(39900)).toBe('$399');
  });

  it('не использует разделитель тысяч, поэтому запятая всегда десятичная', () => {
    expect(formatUsd(123456)).toBe('$1234,56');
  });

  it('не меняет ни одну сумму каталога, отличается только разделитель', () => {
    for (const tariff of TARIFFS) {
      const shown = formatUsd(tariff.priceCents).replace('$', '').replace(',', '.');
      expect(Number(shown)).toBe(tariff.priceCents / 100);
    }
  });
});
