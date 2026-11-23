export type AddPurchaseResult =
  { readonly kind: 'added'; readonly persisted: boolean } | { readonly kind: 'duplicate' };
