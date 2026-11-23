import { Product } from '../../../products/core/models/product.interface';
import { Tariff } from '../../../products/core/models/tariff.interface';

export interface TariffOption {
  readonly tariff: Tariff;
  readonly product: Product;
  readonly priceLabel: string;
  /** `null`, если тариф можно купить; иначе — причина, почему нельзя. */
  readonly unavailableReason: string | null;
  /** Информационная пометка, покупку не блокирует: у читателя уже есть все права тарифа. */
  readonly includedNote: string | null;
}
