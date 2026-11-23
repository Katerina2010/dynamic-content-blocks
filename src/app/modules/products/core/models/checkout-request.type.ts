import { EntitlementId } from './entitlement-id.type';
import { ProductId } from './product-id.type';

/**
 * Зачем открывается checkout.
 * - `product`: читатель хочет этот продукт; подходят только его собственные тарифы.
 * - `entitlement`: читателю нужно право (например, на вебинар); подходит любой тариф,
 *   который его даёт, включая тарифы других продуктов, например The Bell.Unlimited.
 */
export type CheckoutRequest =
  | { readonly kind: 'product'; readonly productId: ProductId }
  | {
      readonly kind: 'entitlement';
      readonly entitlement: EntitlementId;
      readonly contextProductId: ProductId;
      readonly reason: string;
      /**
       * Только Live: напоминание читателям, у которых право может уже быть по настоящей
       * подписке, невидимой для этого приложения. Формулирует вызывающий модуль: он знает контекст.
       */
      readonly subscriberNote?: string;
    };
