import { InjectionToken } from '@angular/core';
import { ProductCatalog } from '../interfaces/product-catalog.interface';

export const PRODUCT_CATALOG = new InjectionToken<ProductCatalog>('PRODUCT_CATALOG');
