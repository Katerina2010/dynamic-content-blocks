import { ShowcaseSettings } from '../../../products/core/models/showcase-settings.type';
import { WebinarsShowcaseSettings } from '../../../webinars/core/models/webinars-showcase-settings.type';

/**
 * Ширина ячейки в 12-колоночной десктопной сетке: full = 12, half = 6, third = 4,
 * quarter = 3 колонки. На планшете половины и трети сохраняются, четверти идут по две в ряд;
 * на мобильном всё в одну колонку.
 */
export type GridSpan = 'full' | 'half' | 'third' | 'quarter';

/** Как отрисовывается статья: широкая обложка, карточка с обложкой или текстовый заголовок. */
export type ArticlePresentation = 'hero' | 'cover' | 'text';

/**
 * Один слот редакторской сетки. Порядок в массиве — порядок на странице.
 * Только редакторская конфигурация: в ней никогда нет состояния читателя или подписки.
 */
export type GridItemConfig =
  | {
      readonly kind: 'article';
      readonly id: string;
      readonly span: GridSpan;
      readonly articleId: string;
      readonly emphasis: ArticlePresentation;
    }
  | {
      readonly kind: 'product-showcase';
      readonly id: string;
      readonly span: GridSpan;
      readonly settings: ShowcaseSettings;
    }
  | {
      readonly kind: 'webinar-showcase';
      readonly id: string;
      readonly span: GridSpan;
      readonly title: string;
      /** `feature`: одна большая карточка с обложкой; `list`: строка компактных вебинаров. */
      readonly presentation: 'feature' | 'list';
      readonly settings: WebinarsShowcaseSettings;
    };
