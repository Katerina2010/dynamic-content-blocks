import { Provider } from '@angular/core';
import { PRODUCT_CATALOG } from '../../core/tokens/product-catalog.token';
import { StaticProductCatalogRepository } from '../../data/repositories/static-product-catalog.repository';

export const productsDataProviders: Provider[] = [
  { provide: PRODUCT_CATALOG, useClass: StaticProductCatalogRepository },
];
