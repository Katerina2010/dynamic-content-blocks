import { EntitlementId } from '../../../products/core/models/entitlement-id.type';

/**
 * Запись упоминается, только если её анонсирует публичный источник, и предлагается, только
 * когда её публикация подтверждена (`published`), поэтому блок никогда не продаёт запись,
 * которой ещё может не быть.
 */
export type RecordingPolicy =
  | {
      readonly kind: 'included-with-entitlement';
      readonly entitlement: EntitlementId;
      /** Выставляется редактором, когда запись действительно доступна подписчикам. */
      readonly published: boolean;
    }
  | { readonly kind: 'not-announced' };
