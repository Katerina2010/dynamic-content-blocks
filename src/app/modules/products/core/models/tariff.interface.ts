import { BillingPeriod } from './billing-period.type';
import { EntitlementId } from './entitlement-id.type';
import { ProductId } from './product-id.type';
import { TariffId } from './tariff-id.type';

/** `trial` — вводное предложение; оно никогда не подразумевает права обычного тарифа. */
export type TariffKind = 'trial' | 'recurring';

export type TariffEligibility = 'anyone' | 'new-customers-of-product';

export interface Tariff {
  readonly id: TariffId;
  readonly productId: ProductId;
  readonly title: string;
  readonly kind: TariffKind;
  /** Цена в центах США за один `period`. */
  readonly priceCents: number;
  readonly period: BillingPeriod;
  /** Во что продлевается пробный тариф, как опубликовано The Bell. Только для пробных тарифов. */
  readonly renewsInto?: { readonly priceCents: number; readonly period: BillingPeriod };
  readonly eligibility: TariffEligibility;
  readonly grants: readonly EntitlementId[];
  /** Понятный читателю состав тарифа в формулировках публичной страницы тарифа. */
  readonly features: readonly string[];
}
