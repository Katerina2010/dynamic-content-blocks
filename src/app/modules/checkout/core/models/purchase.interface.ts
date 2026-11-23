import { ProductId } from '../../../products/core/models/product-id.type';
import { TariffId } from '../../../products/core/models/tariff-id.type';

/** Завершённая покупка. Права доступа выводятся из неё и никогда не хранятся отдельно. */
export interface Purchase {
  readonly id: string;
  readonly tariffId: TariffId;
  readonly productId: ProductId;
  /** Момент времени в формате ISO 8601. */
  readonly purchasedAt: string;
}
