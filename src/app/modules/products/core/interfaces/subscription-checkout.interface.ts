import { CheckoutRequest } from '../models/checkout-request.type';

/** Порт, через который блоки витрины начинают покупку. Реализуется модулем checkout. */
export interface SubscriptionCheckout {
  open(request: CheckoutRequest): void;
}
