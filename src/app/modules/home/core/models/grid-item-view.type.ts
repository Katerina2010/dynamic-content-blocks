import { ProductId } from '../../../products/core/models/product-id.type';
import { Article } from './article.interface';
import { ArticlePresentation, GridItemConfig } from './grid-item-config.type';

type ProductShowcaseConfig = Extract<GridItemConfig, { kind: 'product-showcase' }>;
type WebinarShowcaseConfig = Extract<GridItemConfig, { kind: 'webinar-showcase' }>;

export type GridItemView =
  | {
      readonly kind: 'article';
      readonly id: string;
      readonly span: GridItemConfig['span'];
      readonly emphasis: ArticlePresentation;
      readonly article: Article;
    }
  | (ProductShowcaseConfig & {
      /** Продукты, закреплённые в других слотах этой страницы; ротация их пропускает. */
      readonly rotationExclude: readonly ProductId[];
    })
  | WebinarShowcaseConfig;
