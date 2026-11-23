export type PaymentResult =
  | { readonly status: 'approved'; readonly transactionId: string }
  | { readonly status: 'declined'; readonly message: string }
  | { readonly status: 'technical-error' };
