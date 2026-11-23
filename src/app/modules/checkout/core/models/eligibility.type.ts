import { Tariff } from '../../../products/core/models/tariff.interface';

export type EligibilityFailure =
  | 'unknown-tariff'
  | 'product-mismatch'
  | 'entitlement-mismatch'
  | 'already-owned'
  | 'trial-not-eligible'
  | 'plan-change-unsupported';

export type EligibilityResult =
  | { readonly ok: true; readonly tariff: Tariff }
  | { readonly ok: false; readonly failure: EligibilityFailure };
