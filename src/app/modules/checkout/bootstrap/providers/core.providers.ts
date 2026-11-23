import { DOCUMENT, Provider } from '@angular/core';
import { ENTITLEMENT_QUERY } from '../../../products/core/tokens/entitlement-query.token';
import { SUBSCRIPTION_CHECKOUT } from '../../../products/core/tokens/subscription-checkout.token';
import { CheckoutFacade } from '../../core/facades/checkout.facade';
import { CheckoutConfig } from '../../core/models/checkout-config.interface';
import { CheckoutMode } from '../../core/models/checkout-mode.type';
import { EntitlementService } from '../../core/services/entitlement.service';
import { CHECKOUT_CONFIG } from '../../core/tokens/checkout-config.token';
import { CHECKOUT_SETTINGS } from '../configuration/checkout.config';
import { resolveCheckoutMode } from '../configuration/resolve-checkout-mode';

/** Checkout реализует контракты коммерческого модуля, объявленные в модуле products. */
export function checkoutCoreProviders(defaultMode: CheckoutMode): Provider[] {
  return [
    {
      provide: CHECKOUT_CONFIG,
      deps: [DOCUMENT],
      useFactory: (document: Document): CheckoutConfig => ({
        ...CHECKOUT_SETTINGS,
        mode: resolveCheckoutMode(document.location.search, defaultMode),
      }),
    },
    CheckoutFacade,
    EntitlementService,
    { provide: SUBSCRIPTION_CHECKOUT, useExisting: CheckoutFacade },
    { provide: ENTITLEMENT_QUERY, useExisting: EntitlementService },
  ];
}
