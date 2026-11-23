import { TariffId } from '../../../products/core/models/tariff-id.type';
import { CheckoutMode } from './checkout-mode.type';
import { OfficialCheckout } from './official-checkout.interface';
import { PaymentResult } from './payment-result.type';

export interface DemoCard {
  readonly number: string;
  readonly outcome: PaymentResult['status'];
  readonly label: string;
}

export interface CheckoutConfig {
  readonly mode: CheckoutMode;
  /**
   * Режим Live: явный allowlist проверенных официальных страниц оплаты. Тариф без записи
   * получает честный шаг «не подтверждено» вместо ссылки.
   */
  readonly officialCheckouts: Partial<Record<TariffId, OfficialCheckout>>;
  /** Режим Demo: имитация времени обработки в mock-шлюзе. */
  readonly processingDelayMs: number;
  /** Режим Demo: тестовые карты с детерминированным исходом, показываются в форме оплаты. */
  readonly demoCards: readonly DemoCard[];
}
