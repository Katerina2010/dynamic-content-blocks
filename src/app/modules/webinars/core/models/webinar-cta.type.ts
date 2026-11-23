import { EntitlementId } from '../../../products/core/models/entitlement-id.type';

export type WebinarCta =
  | { readonly kind: 'request-access'; readonly label: string; readonly entitlement: EntitlementId }
  | { readonly kind: 'external'; readonly label: string; readonly url: string }
  | { readonly kind: 'granted'; readonly note: string }
  | { readonly kind: 'none'; readonly note: string };
