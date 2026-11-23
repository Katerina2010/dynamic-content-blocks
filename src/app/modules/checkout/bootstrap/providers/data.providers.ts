import { Injector, Provider } from '@angular/core';
import { PurchaseRepository } from '../../core/interfaces/purchase-repository.interface';
import { CheckoutConfig } from '../../core/models/checkout-config.interface';
import { CHECKOUT_CONFIG } from '../../core/tokens/checkout-config.token';
import { PAYMENT_GATEWAY } from '../../core/tokens/payment-gateway.token';
import { PURCHASE_REPOSITORY } from '../../core/tokens/purchase-repository.token';
import { MockPaymentGateway } from '../../data/adapters/mock-payment.gateway';
import { LivePurchaseRepository } from '../../data/repositories/live-purchase.repository';
import { LocalPurchaseRepository } from '../../data/repositories/local-purchase.repository';

/**
 * Demo: покупки в localStorage этого браузера и mock-шлюз.
 * Live: локальных покупок нет вовсе (localStorage даже не читается); шлюз никогда
 * не вызывается, потому что читатель платит на официальной странице оплаты The Bell.
 */
export const checkoutDataProviders: Provider[] = [
  LocalPurchaseRepository,
  LivePurchaseRepository,
  {
    provide: PURCHASE_REPOSITORY,
    deps: [CHECKOUT_CONFIG, Injector],
    useFactory: (config: CheckoutConfig, injector: Injector): PurchaseRepository =>
      config.mode === 'live'
        ? injector.get(LivePurchaseRepository)
        : injector.get(LocalPurchaseRepository),
  },
  { provide: PAYMENT_GATEWAY, useClass: MockPaymentGateway },
];
