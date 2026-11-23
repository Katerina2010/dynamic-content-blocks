import { formatUsd } from '../../../../shared/format/format-usd';
import { BillingPeriod } from '../models/billing-period.type';
import { Tariff } from '../models/tariff.interface';

const PERIOD_LABEL: Record<BillingPeriod, string> = {
  month: 'в месяц',
  'half-year': 'за полгода',
  year: 'в год',
};

/** "$14,90 в месяц" или для пробного тарифа "$1 за первый месяц, далее $14,90 в месяц". */
export function describePrice(tariff: Tariff): string {
  if (tariff.kind === 'trial') {
    const intro = `${formatUsd(tariff.priceCents)} за первый месяц`;
    return tariff.renewsInto
      ? `${intro}, далее ${formatUsd(tariff.renewsInto.priceCents)} ${PERIOD_LABEL[tariff.renewsInto.period]}`
      : intro;
  }
  return `${formatUsd(tariff.priceCents)} ${PERIOD_LABEL[tariff.period]}`;
}
