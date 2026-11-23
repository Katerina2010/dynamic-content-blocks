import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { productsCoreProviders } from './core.providers';
import { productsDataProviders } from './data.providers';

/**
 * Подключение модуля products. `SUBSCRIPTION_CHECKOUT` и `ENTITLEMENT_QUERY` объявлены здесь,
 * но реализуются и связываются модулем checkout.
 */
export function provideProductsModule(): EnvironmentProviders {
  return makeEnvironmentProviders([...productsDataProviders, ...productsCoreProviders]);
}
