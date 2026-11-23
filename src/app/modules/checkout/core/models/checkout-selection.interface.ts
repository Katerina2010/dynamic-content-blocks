import { Product } from '../../../products/core/models/product.interface';
import { Tariff } from '../../../products/core/models/tariff.interface';

export interface CheckoutSelection {
  readonly product: Product;
  readonly tariff: Tariff;
  readonly priceLabel: string;
}
