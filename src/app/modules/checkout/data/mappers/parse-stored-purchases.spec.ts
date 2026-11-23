import { StaticProductCatalogRepository } from '../../../products/data/repositories/static-product-catalog.repository';
import { parseStoredPurchases } from './parse-stored-purchases';

const catalog = new StaticProductCatalogRepository();
const VALID = {
  id: 'demo-1',
  tariffId: 'tech-monthly',
  productId: 'tech',
  purchasedAt: '2026-11-22T10:00:00.000Z',
};

function parse(value: unknown): unknown[] {
  return parseStoredPurchases(JSON.stringify(value), catalog);
}

describe('parseStoredPurchases: разбор сохранённых покупок', () => {
  it('читает корректные данные', () => {
    expect(parse({ version: 1, purchases: [VALID] })).toEqual([VALID]);
  });

  it('возвращает пустой список при отсутствующем или повреждённом JSON', () => {
    expect(parseStoredPurchases(null, catalog)).toEqual([]);
    expect(parseStoredPurchases('{not json', catalog)).toEqual([]);
  });

  it('отклоняет неверную структуру или версию', () => {
    expect(parse([VALID])).toEqual([]);
    expect(parse({ version: 2, purchases: [VALID] })).toEqual([]);
    expect(parse({ version: 1, purchases: 'x' })).toEqual([]);
  });

  it('отбрасывает записи с неизвестными тарифами, несовпадающими продуктами или некорректными полями', () => {
    const result = parse({
      version: 1,
      purchases: [
        VALID,
        { ...VALID, id: 'x', tariffId: 'tech-forever' },
        { ...VALID, id: 'y', tariffId: 'invest-monthly', productId: 'tech' },
        { ...VALID, id: '' },
        {
          ...VALID,
          id: 'z',
          tariffId: 'news-monthly',
          productId: 'news',
          purchasedAt: 'yesterday',
        },
        null,
      ],
    });
    expect(result).toEqual([VALID]);
  });

  it('отбрасывает дубликаты одного и того же тарифа', () => {
    expect(parse({ version: 1, purchases: [VALID, { ...VALID, id: 'demo-2' }] })).toEqual([VALID]);
  });
});
