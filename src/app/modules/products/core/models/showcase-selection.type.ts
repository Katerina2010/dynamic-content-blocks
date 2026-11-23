import { ProductId } from './product-id.type';

/**
 * - `pinned`: редактор закрепил корректный продукт.
 * - `rotation`: продукт дня.
 * - `rotation-fallback`: редактор закрепил неизвестный продукт; вместо него используется ротация.
 */
export type ShowcaseSelection =
  | { readonly kind: 'pinned'; readonly productId: ProductId }
  | { readonly kind: 'rotation'; readonly productId: ProductId; readonly day: number }
  | {
      readonly kind: 'rotation-fallback';
      readonly productId: ProductId;
      readonly day: number;
      readonly invalidPin: string;
    };
