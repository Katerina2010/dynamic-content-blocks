import { TestBed } from '@angular/core/testing';
import { ROTATION_CONFIG_VALUE } from '../../../products/bootstrap/configuration/rotation.config';
import { RotationConfig } from '../../../products/core/models/rotation-config.interface';
import { selectShowcaseProduct } from '../../../products/core/rules/select-showcase-product';
import { ROTATION_CONFIG } from '../../../products/core/tokens/rotation-config.token';
import { HOME_GRID } from '../../bootstrap/configuration/home-grid.config';
import { StaticArticlesRepository } from '../../data/repositories/static-articles.repository';
import { GridItemConfig } from '../models/grid-item-config.type';
import { GridItemView } from '../models/grid-item-view.type';
import { ARTICLES_REPOSITORY } from '../tokens/articles-repository.token';
import { HOME_GRID_CONFIG } from '../tokens/home-grid-config.token';
import { HomeGridFacade } from './home-grid.facade';

const NOV_23_TO_30 = ['23', '24', '25', '26', '27', '28', '29', '30'].map(
  (day) => `2026-11-${day}T12:00:00+03:00`,
);

const rotating = (id: string): GridItemConfig => ({
  kind: 'product-showcase',
  id,
  span: 'third',
  settings: { mode: 'rotation' },
});
const pinned = (id: string, productId: string): GridItemConfig => ({
  kind: 'product-showcase',
  id,
  span: 'third',
  settings: { mode: 'pinned', productId },
});

function resolve(
  config: readonly GridItemConfig[],
  rotation: RotationConfig = ROTATION_CONFIG_VALUE,
): readonly GridItemView[] {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      HomeGridFacade,
      { provide: HOME_GRID_CONFIG, useValue: config },
      { provide: ARTICLES_REPOSITORY, useClass: StaticArticlesRepository },
      { provide: ROTATION_CONFIG, useValue: rotation },
    ],
  });
  return TestBed.inject(HomeGridFacade).items;
}

/**
 * Продукты, которые страница показывает в момент `now`, слот за слотом — точно так же,
 * как их выбирают блоки витрины.
 */
function productsOn(now: string, items: readonly GridItemView[]): string[] {
  return items.flatMap((item) => {
    if (item.kind !== 'product-showcase') {
      return [];
    }
    const selection = selectShowcaseProduct({
      now: new Date(now),
      settings: item.settings,
      rotation: ROTATION_CONFIG_VALUE,
      exclude: item.rotationExclude,
    });
    return selection ? [selection.productId] : [];
  });
}

describe('HomeGridFacade: сборка слотов главной', () => {
  it('не показывает ни один продукт дважды на настоящей главной 8 дней подряд', () => {
    const items = resolve(HOME_GRID);
    const pages = NOV_23_TO_30.map((day) => productsOn(day, items));
    expect(pages).toEqual([
      ['invest', 'unlimited'],
      ['news', 'unlimited'],
      ['tech', 'unlimited'],
      ['invest', 'unlimited'],
      ['news', 'unlimited'],
      ['tech', 'unlimited'],
      ['invest', 'unlimited'],
      ['news', 'unlimited'],
    ]);
  });

  it('возвращает Unlimited в ротацию, когда его закреплённый слот удалён', () => {
    const items = resolve(HOME_GRID.filter((item) => item.id !== 'slot-pinned-unlimited'));
    const shown = NOV_23_TO_30.map((day) => productsOn(day, items)[0]);
    expect(shown).toEqual([
      'invest',
      'unlimited',
      'news',
      'tech',
      'invest',
      'unlimited',
      'news',
      'tech',
    ]);
  });

  it('следует за редактором при смене закреплённого продукта', () => {
    const items = resolve([rotating('a'), pinned('b', 'tech')]);
    expect(items.find((item) => item.id === 'a')).toMatchObject({ rotationExclude: ['tech'] });
    for (const day of NOV_23_TO_30) {
      const page = productsOn(day, items);
      expect(page).toHaveLength(2);
      expect(new Set(page).size).toBe(2);
      expect(page[1]).toBe('tech');
    }
  });

  it('исключает несколько закреплённых продуктов независимо от порядка слотов', () => {
    const items = resolve([pinned('p1', 'news'), rotating('r'), pinned('p2', 'invest')]);
    expect(items.find((item) => item.id === 'r')).toMatchObject({
      rotationExclude: ['news', 'invest'],
    });
    expect(NOV_23_TO_30.map((day) => productsOn(day, items)[1])).not.toContain('news');
  });

  it('не исключает неизвестные закреплённые id: неизвестное закрепление ротируется как ротируемый слот', () => {
    const alone = resolve([pinned('x', 'the-bell-pro'), pinned('u', 'unlimited')]);
    expect(alone.map((item) => item.id)).toEqual(['x', 'u']);
    expect(alone[0]).toMatchObject({ rotationExclude: ['unlimited'] });

    // Если на странице уже есть ротируемый слот, неизвестное закрепление повторило бы его,
    // поэтому оно пропускается.
    const withRotation = resolve([rotating('r'), pinned('x', 'the-bell-pro')]);
    expect(withRotation.map((item) => item.id)).toEqual(['r']);
  });

  it('пропускает второй слот, закреплённый на тот же продукт', () => {
    const items = resolve([pinned('a', 'unlimited'), pinned('b', 'unlimited')]);
    expect(items.map((item) => item.id)).toEqual(['a']);
  });

  it('пропускает ротируемый слот, когда все продукты ротации закреплены на странице', () => {
    const items = resolve([
      rotating('r'),
      pinned('a', 'news'),
      pinned('b', 'tech'),
      pinned('c', 'invest'),
      pinned('d', 'unlimited'),
    ]);
    expect(items.map((item) => item.id)).toEqual(['a', 'b', 'c', 'd']);
    for (const day of NOV_23_TO_30) {
      expect(new Set(productsOn(day, items)).size).toBe(4);
    }
  });

  it('пропускает слоты с повторяющимися id и с неизвестными статьями', () => {
    const items = resolve([
      { kind: 'article', id: 's1', span: 'third', articleId: 'no-such-article', emphasis: 'text' },
      rotating('s2'),
      pinned('s2', 'tech'),
    ]);
    expect(items.map((item) => item.id)).toEqual(['s2']);
    expect(items[0]).toMatchObject({ settings: { mode: 'rotation' }, rotationExclude: [] });
  });
});
