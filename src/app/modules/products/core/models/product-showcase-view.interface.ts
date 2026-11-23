import { Product } from './product.interface';
import { ShowcaseSelection } from './showcase-selection.type';

export interface ProductShowcaseView {
  readonly product: Product;
  readonly selection: ShowcaseSelection['kind'];
  readonly badge: string;
  /** Главное предложение, например "$1 за первый месяц, далее $14,90 в месяц". */
  readonly offer: string | null;
  readonly owned: boolean;
  /**
   * Показывается, когда продукт оформлен; предупреждает, если покупка не переживёт
   * перезагрузку страницы.
   */
  readonly ownedLabel: string;
  /**
   * Показывается, когда этот продукт не оформлен, но всё, что он даёт, уже покрыто другой
   * покупкой (например, Tech для читателя с Unlimited). Информационная пометка: покупка
   * не блокируется.
   */
  readonly includedLabel: string | null;
  readonly ctaLabel: string;
}
