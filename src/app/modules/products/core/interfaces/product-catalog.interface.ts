import { EntitlementId } from '../models/entitlement-id.type';
import { Product } from '../models/product.interface';
import { ProductId } from '../models/product-id.type';
import { Tariff } from '../models/tariff.interface';
import { TariffId } from '../models/tariff-id.type';

/** Каталог только для чтения: продукты, тарифы и права, которые даёт каждый тариф. */
export interface ProductCatalog {
  product(id: ProductId): Product | undefined;
  tariff(id: TariffId): Tariff | undefined;
  tariffsOf(productId: ProductId): readonly Tariff[];
  tariffsGranting(entitlement: EntitlementId): readonly Tariff[];
}
