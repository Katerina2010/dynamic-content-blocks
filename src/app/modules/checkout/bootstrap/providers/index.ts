import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CheckoutMode } from '../../core/models/checkout-mode.type';
import { checkoutCoreProviders } from './core.providers';
import { checkoutDataProviders } from './data.providers';

export interface CheckoutModuleOptions {
  /** Режим, когда в URL нет `?checkout=demo|live`; задаётся для каждого окружения сборки. */
  readonly defaultMode: CheckoutMode;
}

export function provideCheckoutModule(options: CheckoutModuleOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...checkoutDataProviders,
    ...checkoutCoreProviders(options.defaultMode),
  ]);
}
