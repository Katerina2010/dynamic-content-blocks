import { ARTICLES } from '../../data/sources/articles.data';
import { GridItemConfig, GridSpan } from '../../core/models/grid-item-config.type';
import { HOME_GRID } from './home-grid.config';

const COLUMNS = 12;
const DESKTOP: Record<GridSpan, number> = { full: 12, half: 6, third: 4, quarter: 3 };
const TABLET: Record<GridSpan, number> = { full: 12, half: 6, third: 4, quarter: 6 };

/**
 * Раскладывает слоты слева направо, как автоматическое размещение в CSS Grid;
 * возвращает колонки каждого ряда.
 */
function rowWidths(items: readonly GridItemConfig[], widths: Record<GridSpan, number>): number[] {
  const rows: number[] = [];
  let current = 0;
  for (const item of items) {
    const width = widths[item.span];
    if (current + width > COLUMNS) {
      rows.push(current);
      current = 0;
    }
    current += width;
  }
  rows.push(current);
  return rows;
}

describe('HOME_GRID (демонстрационная раскладка)', () => {
  it('является корректной конфигурацией: уникальные id слотов, существующие статьи, каждая статья один раз', () => {
    const ids = HOME_GRID.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    const articleIds = HOME_GRID.flatMap((item) =>
      item.kind === 'article' ? [item.articleId] : [],
    );
    const known = new Set(ARTICLES.map((article) => article.id));
    expect(articleIds.filter((id) => !known.has(id))).toEqual([]);
    expect(new Set(articleIds).size).toBe(articleIds.length);
  });

  it('содержит оба новых блока внутри сетки, включая оба вида вебинаров', () => {
    const kinds = HOME_GRID.map((item) =>
      item.kind === 'webinar-showcase' ? `webinar-${item.presentation}` : item.kind,
    );
    expect(kinds).toContain('product-showcase');
    expect(kinds).toContain('webinar-feature');
    expect(kinds).toContain('webinar-list');
  });

  it('полностью заполняет каждый ряд на десктопе, поэтому в выбранной раскладке нет пустот', () => {
    expect(rowWidths(HOME_GRID, DESKTOP).every((width) => width === COLUMNS)).toBe(true);
  });

  it('полностью заполняет и каждый ряд на планшете', () => {
    expect(rowWidths(HOME_GRID, TABLET).every((width) => width === COLUMNS)).toBe(true);
  });
});
