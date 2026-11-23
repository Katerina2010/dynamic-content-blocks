/**
 * `demo`: наши модальные окна, тестовые карты, mock-оплата и демо-права в этом браузере.
 * `live`: после выбора тарифа читатель переходит на официальный checkout The Bell; это
 * приложение ничего не списывает, не записывает и не выдаёт.
 */
export type CheckoutMode = 'demo' | 'live';

export const CHECKOUT_MODES: readonly CheckoutMode[] = ['demo', 'live'];

export function isCheckoutMode(value: unknown): value is CheckoutMode {
  return CHECKOUT_MODES.some((mode) => mode === value);
}
