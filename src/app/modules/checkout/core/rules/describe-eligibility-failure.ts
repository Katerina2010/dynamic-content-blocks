import { EligibilityFailure } from '../models/eligibility.type';

const MESSAGES: Record<EligibilityFailure, string> = {
  'unknown-tariff': 'Такого тарифа нет.',
  'product-mismatch': 'Этот тариф относится к другому продукту.',
  'entitlement-mismatch': 'Этот тариф не даёт нужного доступа.',
  'already-owned': 'Уже оформлен',
  'trial-not-eligible': 'Только для новых подписчиков продукта',
  'plan-change-unsupported': 'У вас уже есть тариф этого продукта. Смена тарифа в демо недоступна',
};

export function describeEligibilityFailure(failure: EligibilityFailure): string {
  return MESSAGES[failure];
}
