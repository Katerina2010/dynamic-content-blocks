/** Исходные значения формы. Передаются в шлюз один раз и нигде не хранятся. */
export interface PaymentDetails {
  readonly email: string;
  readonly cardNumber: string;
  readonly expiry: string;
  readonly cvc: string;
}
