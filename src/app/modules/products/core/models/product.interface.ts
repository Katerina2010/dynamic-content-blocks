import { ProductId } from './product-id.type';
import { TariffId } from './tariff-id.type';

export interface Product {
  readonly id: ProductId;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  /** Короткая подпись для сгенерированного визуального знака. */
  readonly mark: string;
  readonly highlights: readonly string[];
  /** Явный порядок отображения тарифов внутри checkout. */
  readonly tariffIds: readonly TariffId[];
  readonly sourceUrl: string;
}
