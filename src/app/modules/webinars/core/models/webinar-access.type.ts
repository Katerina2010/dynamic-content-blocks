import { EntitlementId } from '../../../products/core/models/entitlement-id.type';
import { ProductId } from '../../../products/core/models/product-id.type';

/**
 * - `entitlement`: для участия нужно право, которое дают тарифы The Bell.
 * - `external-membership`: доступ продаётся вне checkout The Bell (например, членство
 *   в The Chat по рекомендациям) — мы только даём ссылку и никогда не имитируем покупку.
 */
export type WebinarAccess =
  | {
      readonly kind: 'entitlement';
      readonly entitlement: EntitlementId;
      readonly productId: ProductId;
    }
  | {
      readonly kind: 'external-membership';
      readonly membershipName: string;
      readonly url: string;
      readonly ctaLabel: string;
    };
