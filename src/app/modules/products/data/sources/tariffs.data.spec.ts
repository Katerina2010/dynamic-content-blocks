import { TARIFFS } from './tariffs.data';

const trial = (id: string) => TARIFFS.find((tariff) => tariff.id === id);

describe('TARIFFS: условия пробных тарифов', () => {
  it('сообщают, что вебинары и полный архив открываются со 2-го месяца по полной цене', () => {
    expect(trial('tech-trial')?.features).toContain(
      'Вебинары и полный архив — со 2-го месяца, после перехода на $14,90/месяц',
    );
    expect(trial('invest-trial')?.features).toContain(
      'Вебинары и полный архив — со 2-го месяца, после перехода на $18,90/месяц',
    );
  });

  it('не меняют цены, условия доступности и права', () => {
    expect(trial('tech-trial')).toMatchObject({
      priceCents: 100,
      renewsInto: { priceCents: 1490, period: 'month' },
      eligibility: 'new-customers-of-product',
      grants: ['tech.newsletter'],
    });
    expect(trial('invest-trial')).toMatchObject({
      priceCents: 100,
      renewsInto: { priceCents: 1890, period: 'month' },
      eligibility: 'new-customers-of-product',
      grants: ['invest.newsletter'],
    });
  });
});
