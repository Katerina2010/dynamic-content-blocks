import { ChargeRequest } from '../models/charge-request.interface';
import { PaymentResult } from '../models/payment-result.type';

/** Порт оплаты. В MVP подключён mock; в production — адаптер к настоящему billing-backend. */
export interface PaymentGateway {
  charge(request: ChargeRequest): Promise<PaymentResult>;
}
