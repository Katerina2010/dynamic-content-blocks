import { CheckoutMode, isCheckoutMode } from '../../core/models/checkout-mode.type';

export const CHECKOUT_MODE_PARAM = 'checkout';

/**
 * Параметр `?checkout=demo|live` переопределяет режим по умолчанию,
 * заданный окружением. Остальные значения игнорируются.
 */
export function resolveCheckoutMode(search: string, defaultMode: CheckoutMode): CheckoutMode {
  const requested = new URLSearchParams(search).get(CHECKOUT_MODE_PARAM);
  return isCheckoutMode(requested) ? requested : defaultMode;
}
