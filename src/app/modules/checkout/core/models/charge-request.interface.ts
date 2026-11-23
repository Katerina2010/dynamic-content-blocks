import { TariffId } from '../../../products/core/models/tariff-id.type';

export interface ChargeRequest {
  readonly tariffId: TariffId;
  readonly amountCents: number;
  readonly cardNumber: string;
  readonly email: string;
}
