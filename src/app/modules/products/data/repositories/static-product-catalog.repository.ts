import { Injectable } from '@angular/core';
import { ProductCatalog } from '../../core/interfaces/product-catalog.interface';
import { EntitlementId } from '../../core/models/entitlement-id.type';
import { Product } from '../../core/models/product.interface';
import { ProductId } from '../../core/models/product-id.type';
import { Tariff } from '../../core/models/tariff.interface';
import { TariffId } from '../../core/models/tariff-id.type';
import { PRODUCTS } from '../sources/products.data';
import { TARIFFS } from '../sources/tariffs.data';

/**
 * Типизированный локальный каталог из проверенных публичных данных.
 * Может быть заменён репозиторием, работающим через API.
 */
@Injectable()
export class StaticProductCatalogRepository implements ProductCatalog {
  private readonly productsById = new Map(PRODUCTS.map((product) => [product.id, product]));
  private readonly tariffsById = new Map(TARIFFS.map((tariff) => [tariff.id, tariff]));

  product(id: ProductId): Product | undefined {
    return this.productsById.get(id);
  }

  tariff(id: TariffId): Tariff | undefined {
    return this.tariffsById.get(id);
  }

  tariffsOf(productId: ProductId): readonly Tariff[] {
    const product = this.productsById.get(productId);
    if (!product) {
      return [];
    }
    return product.tariffIds
      .map((id) => this.tariffsById.get(id))
      .filter((tariff): tariff is Tariff => tariff?.productId === productId);
  }

  tariffsGranting(entitlement: EntitlementId): readonly Tariff[] {
    return TARIFFS.filter((tariff) => tariff.grants.includes(entitlement));
  }
}
