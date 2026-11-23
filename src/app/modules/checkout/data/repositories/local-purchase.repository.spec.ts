import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KEY_VALUE_STORAGE } from '../../../../shared/storage/key-value-storage.token';
import { MemoryStorage } from '../../../../shared/storage/memory-storage';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { StaticProductCatalogRepository } from '../../../products/data/repositories/static-product-catalog.repository';
import { Purchase } from '../../core/models/purchase.interface';
import { parseStoredPurchases } from '../mappers/parse-stored-purchases';
import { LocalPurchaseRepository, PURCHASES_STORAGE_KEY } from './local-purchase.repository';

const PURCHASE: Purchase = {
  id: 'demo-1',
  tariffId: 'tech-monthly',
  productId: 'tech',
  purchasedAt: '2026-11-22T10:00:00.000Z',
};

function createRepository(storage: MemoryStorage): LocalPurchaseRepository {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      LocalPurchaseRepository,
      { provide: KEY_VALUE_STORAGE, useValue: storage },
      { provide: PRODUCT_CATALOG, useClass: StaticProductCatalogRepository },
    ],
  });
  return TestBed.inject(LocalPurchaseRepository);
}

describe('LocalPurchaseRepository: покупки в хранилище браузера', () => {
  it('сохраняет покупки и восстанавливает их после «перезагрузки»', () => {
    const storage = new MemoryStorage();
    expect(createRepository(storage).add(PURCHASE)).toEqual({ kind: 'added', persisted: true });

    const reloaded = createRepository(storage);
    expect(reloaded.purchases()).toEqual([PURCHASE]);
    expect(storage.read(PURCHASES_STORAGE_KEY)).toContain('"version":1');
  });

  it('не дублирует покупку того же тарифа', () => {
    const repository = createRepository(new MemoryStorage());
    repository.add(PURCHASE);
    expect(repository.add({ ...PURCHASE, id: 'demo-2' })).toEqual({ kind: 'duplicate' });
    expect(repository.purchases()).toHaveLength(1);
  });

  it('начинает с пустого списка при повреждённом хранилище', () => {
    const storage = new MemoryStorage();
    storage.write(PURCHASES_STORAGE_KEY, '{"version":1,"purchases":[');
    expect(createRepository(storage).purchases()).toEqual([]);
  });

  it('держит покупку в памяти и сообщает memory-only, если хранилище недоступно', () => {
    const repository = createRepository(new MemoryStorage({ failWrites: true }));
    expect(repository.add(PURCHASE)).toEqual({ kind: 'added', persisted: false });
    expect(repository.purchases()).toEqual([PURCHASE]);
    expect(repository.persistence()).toBe('memory-only');

    repository.refresh();
    expect(repository.purchases()).toEqual([PURCHASE]);
    expect(repository.add(INVEST)).toEqual({ kind: 'added', persisted: false });
    expect(repository.purchases()).toEqual([PURCHASE, INVEST]);
  });
});

const INVEST: Purchase = {
  id: 'demo-2',
  tariffId: 'invest-monthly',
  productId: 'invest',
  purchasedAt: '2026-11-22T11:00:00.000Z',
};
const INVEST_TRIAL: Purchase = { ...INVEST, id: 'demo-3', tariffId: 'invest-trial' };

describe('LocalPurchaseRepository в нескольких вкладках (общее хранилище)', () => {
  /** Два работающих репозитория над одним хранилищем, как две открытые вкладки одного origin. */
  function twoTabs(storage: MemoryStorage): [LocalPurchaseRepository, LocalPurchaseRepository] {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: KEY_VALUE_STORAGE, useValue: storage },
        { provide: PRODUCT_CATALOG, useClass: StaticProductCatalogRepository },
      ],
    });
    const parent = TestBed.inject(EnvironmentInjector);
    const tab = (): LocalPurchaseRepository =>
      createEnvironmentInjector([LocalPurchaseRepository], parent).get(LocalPurchaseRepository);
    return [tab(), tab()];
  }

  it('никогда не перезаписывает покупку, сделанную в другой вкладке', () => {
    const storage = new MemoryStorage();
    const [tabA, tabB] = twoTabs(storage);
    tabA.add(PURCHASE);
    expect(tabB.add(INVEST)).toEqual({ kind: 'added', persisted: true });

    const stored = parseStoredPurchases(
      storage.read(PURCHASES_STORAGE_KEY),
      new StaticProductCatalogRepository(),
    );
    expect(stored.map((purchase) => purchase.tariffId)).toEqual(['tech-monthly', 'invest-monthly']);
    expect(tabB.purchases()).toEqual([PURCHASE, INVEST]);
  });

  it('сообщает о дубликате, если тот же тариф куплен в другой вкладке, и ничего не записывает', () => {
    const storage = new MemoryStorage();
    const [tabA, tabB] = twoTabs(storage);
    tabA.add(PURCHASE);
    const before = storage.read(PURCHASES_STORAGE_KEY);
    expect(tabB.add({ ...PURCHASE, id: 'demo-other-tab' })).toEqual({ kind: 'duplicate' });
    expect(storage.read(PURCHASES_STORAGE_KEY)).toBe(before);
    expect(tabB.purchases()).toEqual([PURCHASE]);
  });

  it('refresh() подхватывает покупки, записанные другой вкладкой', () => {
    const storage = new MemoryStorage();
    const [tabA, tabB] = twoTabs(storage);
    tabA.add(PURCHASE);
    expect(tabB.purchases()).toEqual([]);
    tabB.refresh();
    expect(tabB.purchases()).toEqual([PURCHASE]);
  });

  it('обновляется по событию storage из другой вкладки без каких-либо действий в этой вкладке', () => {
    const storage = new MemoryStorage();
    const [tab] = twoTabs(storage);
    storage.writeFromAnotherTab(
      PURCHASES_STORAGE_KEY,
      JSON.stringify({ version: 1, purchases: [INVEST_TRIAL] }),
    );
    expect(tab.purchases()).toEqual([INVEST_TRIAL]);
  });

  it('не восстанавливает из устаревшей памяти покупки, удалённые в другой вкладке', () => {
    const storage = new MemoryStorage();
    const [tabA, tabB] = twoTabs(storage);
    tabA.add(PURCHASE);
    tabB.refresh();
    expect(tabB.purchases()).toEqual([PURCHASE]);

    storage.removeFromAnotherTab(PURCHASES_STORAGE_KEY);
    expect(tabB.purchases()).toEqual([]);
    tabA.add(INVEST);
    const stored = parseStoredPurchases(
      storage.read(PURCHASES_STORAGE_KEY),
      new StaticProductCatalogRepository(),
    );
    expect(stored).toEqual([INVEST]);
  });

  it('не восстанавливает удалённые покупки даже без события storage', () => {
    const storage = new MemoryStorage();
    const [tabA] = twoTabs(storage);
    tabA.add(PURCHASE);
    storage.write(PURCHASES_STORAGE_KEY, JSON.stringify({ version: 1, purchases: [] }));
    tabA.add(INVEST);
    expect(tabA.purchases()).toEqual([INVEST]);
  });
});
