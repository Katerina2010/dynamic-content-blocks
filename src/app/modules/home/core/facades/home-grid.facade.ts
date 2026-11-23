import { Injectable, inject } from '@angular/core';
import { ProductId, isProductId } from '../../../products/core/models/product-id.type';
import { ROTATION_CONFIG } from '../../../products/core/tokens/rotation-config.token';
import { GridItemConfig } from '../models/grid-item-config.type';
import { GridItemView } from '../models/grid-item-view.type';
import { ARTICLES_REPOSITORY } from '../tokens/articles-repository.token';
import { HOME_GRID_CONFIG } from '../tokens/home-grid-config.token';

type ProductShowcaseConfig = Extract<GridItemConfig, { kind: 'product-showcase' }>;

/**
 * Превращает редакторскую конфигурацию сетки в слоты для отрисовки. Слоты с повторяющимися id
 * или отсутствующими статьями пропускаются, чтобы ошибочная запись никогда не ломала страницу.
 *
 * Витрины продуктов никогда не повторяют продукт на одной странице:
 * - продукты, закреплённые на странице, исключаются из ротации (она идёт по оставшимся);
 * - второй слот, закреплённый на тот же продукт, пропускается;
 * - показывается только первый ротируемый слот (неизвестное закрепление тоже ротируется
 *   и поэтому учитывается);
 * - ротируемый слот пропускается, когда все продукты ротации уже закреплены на странице.
 */
@Injectable()
export class HomeGridFacade {
  private readonly config = inject(HOME_GRID_CONFIG);
  private readonly articles = inject(ARTICLES_REPOSITORY);
  private readonly rotation = inject(ROTATION_CONFIG);

  readonly items: readonly GridItemView[] = this.resolve();

  private resolve(): GridItemView[] {
    const slots = this.uniqueSlots();
    const pinned = this.pinnedProducts(slots);
    const shownPins = new Set<ProductId>();
    let rotatingShown = false;
    const items: GridItemView[] = [];

    for (const item of slots) {
      if (item.kind === 'webinar-showcase') {
        items.push(item);
        continue;
      }
      if (item.kind === 'article') {
        const article = this.articles.byId(item.articleId);
        if (article) {
          items.push({
            kind: 'article',
            id: item.id,
            span: item.span,
            emphasis: item.emphasis,
            article,
          });
        }
        continue;
      }

      const pin = this.validPin(item);
      if (pin !== null) {
        if (!shownPins.has(pin)) {
          shownPins.add(pin);
          items.push({ ...item, rotationExclude: [] });
        }
        continue;
      }
      const poolLeft = this.rotation.order.some((productId) => !pinned.includes(productId));
      if (!rotatingShown && poolLeft) {
        rotatingShown = true;
        items.push({ ...item, rotationExclude: pinned });
      }
    }
    return items;
  }

  private uniqueSlots(): GridItemConfig[] {
    const seen = new Set<string>();
    return this.config.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  private pinnedProducts(slots: readonly GridItemConfig[]): ProductId[] {
    const pinned = slots.flatMap((item) => {
      const pin = item.kind === 'product-showcase' ? this.validPin(item) : null;
      return pin === null ? [] : [pin];
    });
    return [...new Set(pinned)];
  }

  private validPin(item: ProductShowcaseConfig): ProductId | null {
    return item.settings.mode === 'pinned' && isProductId(item.settings.productId)
      ? item.settings.productId
      : null;
  }
}
