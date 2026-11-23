import { OfficialCheckout } from './official-checkout.interface';
import { CheckoutRequest } from '../../../products/core/models/checkout-request.type';
import { TariffId } from '../../../products/core/models/tariff-id.type';

export type PaymentPhase =
  | { readonly kind: 'idle' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'declined'; readonly message: string }
  | { readonly kind: 'error'; readonly message: string };

export type CheckoutState =
  | { readonly step: 'closed' }
  | { readonly step: 'tariffs'; readonly request: CheckoutRequest; readonly error: string | null }
  | {
      readonly step: 'payment';
      readonly request: CheckoutRequest;
      readonly tariffId: TariffId;
      readonly phase: PaymentPhase;
    }
  | {
      /** Режим Live: читатель продолжает на официальном checkout (или он ещё не подтверждён). */
      readonly step: 'redirect';
      readonly request: CheckoutRequest;
      readonly tariffId: TariffId;
      readonly checkout: OfficialCheckout | null;
    }
  | {
      readonly step: 'success';
      readonly request: CheckoutRequest;
      readonly tariffId: TariffId;
      readonly persisted: boolean;
    };
