import { Provider } from '@angular/core';
import { ProductShowcaseFacade } from '../../core/facades/product-showcase.facade';
import { ROTATION_CONFIG } from '../../core/tokens/rotation-config.token';
import { ROTATION_CONFIG_VALUE } from '../configuration/rotation.config';

export const productsCoreProviders: Provider[] = [
  { provide: ROTATION_CONFIG, useValue: ROTATION_CONFIG_VALUE },
  ProductShowcaseFacade,
];
