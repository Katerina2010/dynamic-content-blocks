import { GridItemConfig } from '../../core/models/grid-item-config.type';

/**
 * Редакторская сетка главной — то, что редактор собрал бы в конструкторе страниц.
 * Блоки — обычные элементы сетки со своими настройками. В 12-колоночной десктопной сетке
 * каждый ряд этой демо-раскладки заполнен полностью: 4 четверти, 2 половины, 3 трети
 * или 1 на всю ширину.
 */
export const HOME_GRID: readonly GridItemConfig[] = [
  // Ряд 1: текстовые заголовки.
  {
    kind: 'article',
    id: 'slot-1',
    span: 'quarter',
    articleId: 'kaliningrad-alert',
    emphasis: 'text',
  },
  {
    kind: 'article',
    id: 'slot-2',
    span: 'quarter',
    articleId: 'gta-vi-first-day',
    emphasis: 'text',
  },
  {
    kind: 'article',
    id: 'slot-3',
    span: 'quarter',
    articleId: 'wildberries-ceo',
    emphasis: 'text',
  },
  { kind: 'article', id: 'slot-4', span: 'quarter', articleId: 'bitcoin-low', emphasis: 'text' },

  // Ряд 2: статья с обложкой рядом с главным вебинаром The Bell.Tech.
  {
    kind: 'article',
    id: 'slot-5',
    span: 'half',
    articleId: 'week-summary-shenzhen',
    emphasis: 'cover',
  },
  {
    kind: 'webinar-showcase',
    id: 'slot-webinar-feature',
    span: 'half',
    title: 'Вебинар The Bell.Tech',
    presentation: 'feature',
    settings: { rule: 'upcoming-then-recent', limit: 1, series: ['the-bell-tech'] },
  },

  // Ряд 3: две карточки с обложкой и продукт дня.
  { kind: 'article', id: 'slot-6', span: 'third', articleId: 'tech-weekly-ipo', emphasis: 'cover' },
  {
    kind: 'article',
    id: 'slot-7',
    span: 'third',
    articleId: 'invest-megadeals',
    emphasis: 'cover',
  },
  {
    kind: 'product-showcase',
    id: 'slot-product-of-the-day',
    span: 'third',
    settings: { mode: 'rotation' },
  },

  // Ряд 4: главная история на всю ширину.
  {
    kind: 'article',
    id: 'slot-lead',
    span: 'full',
    articleId: 'anthropic-1-4-trillion',
    emphasis: 'hero',
  },

  // Ряд 5: предстоящие и прошедшие события The Chat.
  {
    kind: 'webinar-showcase',
    id: 'slot-webinars',
    span: 'full',
    title: 'Вебинары и встречи',
    presentation: 'list',
    settings: { rule: 'upcoming-then-recent', limit: 4, series: ['the-chat'] },
  },

  // Ряд 6: две карточки с обложкой и продукт, закреплённый редактором.
  { kind: 'article', id: 'slot-8', span: 'third', articleId: 'morning-budget', emphasis: 'cover' },
  {
    kind: 'article',
    id: 'slot-9',
    span: 'third',
    articleId: 'crimean-bridge-arch',
    emphasis: 'cover',
  },
  {
    kind: 'product-showcase',
    id: 'slot-pinned-unlimited',
    span: 'third',
    settings: { mode: 'pinned', productId: 'unlimited' },
  },
];
