import { TARIFF_IDS } from '../../../products/core/models/tariff-id.type';
import { OFFICIAL_CHECKOUTS } from './checkout.config';

/** Точные страницы, проверенные 2026-11-23, и цена, напечатанная на каждой из них. */
const VERIFIED = {
  'news-monthly': ['3aabf776aac30ff2099e89ee092a6542ea2a38ee', '$9,80/месяц'],
  'news-half-year': ['ce648a5a31253d56e5081bd75d80a945481be9ee', '$58,80/полгода'],
  'news-yearly': ['ae3d45988f99cf8b5a7af196491be008295c824b', '$107/год'],
  'tech-trial': [
    '75b1e38437395f34c518010aecf59c9410d400f4',
    '$1,01/месяц сейчас, затем $14,90/месяц',
  ],
  'tech-monthly': ['62a53293080185ee0749eb59c3c84ddbf5b704bf', '$14,90/месяц'],
  'tech-yearly': ['845617d9de8fa266cb2b1ce7813f35b9dc732dd1', '$149/год'],
  'invest-trial': ['7h6fe4e9e9195b2903372640046e01731d7fba', '$1/месяц сейчас, затем $18,90/месяц'],
  'invest-monthly': ['6h7fe4e9e9195b2903372640046e01731d7fbn', '$18,90/месяц'],
  'invest-half-year': ['1ae035b865c161bbf77044a325a44ba07b484704', '$90/полгода'],
  'invest-yearly': ['9ecc6e2623da8c1990a83d11b4afbd89fb5ed830', '$180/год'],
  'unlimited-monthly': ['c0977a668340c51cecc18e17e1e5a38477b189b6', '$39/месяц'],
  'unlimited-half-year': ['18935487d133a12c26d0aa983c60a69c95a40f5b', '$219/полгода'],
  'unlimited-yearly': ['bab2deb6efad5277e5e955ba2a02fdfc9bd77b1f', '$399/год'],
} as const;

describe('OFFICIAL_CHECKOUTS: разрешённый список официальных страниц оплаты', () => {
  it('содержит официальный checkout для каждого из 13 тарифов и ничего лишнего', () => {
    expect(TARIFF_IDS).toHaveLength(13);
    expect(Object.keys(OFFICIAL_CHECKOUTS).sort()).toEqual([...TARIFF_IDS].sort());
  });

  it('сопоставляет каждому тарифу точный проверенный URL и цену со страницы оплаты', () => {
    for (const tariffId of TARIFF_IDS) {
      const [id, price] = VERIFIED[tariffId];
      expect(OFFICIAL_CHECKOUTS[tariffId].url).toBe(`https://thebell.io/checkout/${id}`);
      expect(OFFICIAL_CHECKOUTS[tariffId].priceOnCheckout).toBe(price);
    }
  });

  it('использует для каждого тарифа отдельную страницу на thebell.io по https и без параметров', () => {
    const urls = Object.values(OFFICIAL_CHECKOUTS).map((checkout) => checkout.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/thebell\.io\/checkout\/[0-9a-z]+$/);
    }
  });

  it('сохраняет два не-hex идентификатора Invest в точности как опубликовано', () => {
    expect(OFFICIAL_CHECKOUTS['invest-trial'].url).toBe(
      'https://thebell.io/checkout/7h6fe4e9e9195b2903372640046e01731d7fba',
    );
    expect(OFFICIAL_CHECKOUTS['invest-monthly'].url).toBe(
      'https://thebell.io/checkout/6h7fe4e9e9195b2903372640046e01731d7fbn',
    );
  });

  it('не выдаёт URL для несуществующего тарифа', () => {
    const lookup: Record<string, unknown> = OFFICIAL_CHECKOUTS;
    expect(lookup['tech-free-forever']).toBeUndefined();
    expect(lookup['news-trial']).toBeUndefined();
  });

  it('приводит существенные условия пробных тарифов, напечатанные на страницах оплаты', () => {
    expect(OFFICIAL_CHECKOUTS['tech-trial'].termsOnCheckout).toContain('со 2-го месяца');
    expect(OFFICIAL_CHECKOUTS['tech-trial'].termsOnCheckout).toContain('$14,90/месяц');
    expect(OFFICIAL_CHECKOUTS['invest-trial'].termsOnCheckout).toContain('со 2-го месяца');
    expect(OFFICIAL_CHECKOUTS['invest-trial'].termsOnCheckout).toContain('$18,90/месяц');
    const others = TARIFF_IDS.filter((id) => !id.endsWith('-trial'));
    expect(others.every((id) => OFFICIAL_CHECKOUTS[id].termsOnCheckout === undefined)).toBe(true);
  });
});
