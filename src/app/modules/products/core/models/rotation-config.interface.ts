import { ProductId } from './product-id.type';

export interface RotationConfig {
  /** Фиксированная последовательность; в день N показывается `order[N mod length]`. */
  readonly order: readonly ProductId[];
  /** Зона IANA, которая определяет, где начинаются календарные сутки. */
  readonly timeZone: string;
  /** `YYYY-MM-DD` — день, в который показывается `order[0]`. */
  readonly epochDay: string;
  /** Как часто блоки перепроверяют часы, чтобы продукт переключался сразу после полуночи. */
  readonly refreshIntervalMs: number;
}
