import { InjectionToken } from '@angular/core';
import { SubscriptionCheckout } from '../interfaces/subscription-checkout.interface';

export const SUBSCRIPTION_CHECKOUT = new InjectionToken<SubscriptionCheckout>(
  'SUBSCRIPTION_CHECKOUT',
);
