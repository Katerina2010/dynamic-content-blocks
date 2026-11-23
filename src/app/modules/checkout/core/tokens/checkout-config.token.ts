import { InjectionToken } from '@angular/core';
import { CheckoutConfig } from '../models/checkout-config.interface';

export const CHECKOUT_CONFIG = new InjectionToken<CheckoutConfig>('CHECKOUT_CONFIG');
