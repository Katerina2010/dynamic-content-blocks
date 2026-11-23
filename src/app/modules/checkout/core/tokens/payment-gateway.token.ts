import { InjectionToken } from '@angular/core';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';

export const PAYMENT_GATEWAY = new InjectionToken<PaymentGateway>('PAYMENT_GATEWAY');
