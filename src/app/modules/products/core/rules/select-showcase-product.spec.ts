import { RotationConfig } from '../models/rotation-config.interface';
import { selectShowcaseProduct } from './select-showcase-product';

const ROTATION: RotationConfig = {
  order: ['news', 'tech', 'invest', 'unlimited'],
  timeZone: 'Europe/Moscow',
  epochDay: '2026-01-01',
  refreshIntervalMs: 60_000,
};

function productAt(now: string, rotation: RotationConfig = ROTATION): string | undefined {
  return selectShowcaseProduct({ now: new Date(now), settings: { mode: 'rotation' }, rotation })
    ?.productId;
}

describe('selectShowcaseProduct: выбор продукта для витрины', () => {
  it('показывает order[0] в день эпохи и сдвигается на один продукт в день', () => {
    expect(productAt('2026-01-01T12:00:00+03:00')).toBe('news');
    expect(productAt('2026-01-02T12:00:00+03:00')).toBe('tech');
    expect(productAt('2026-01-03T12:00:00+03:00')).toBe('invest');
    expect(productAt('2026-01-04T12:00:00+03:00')).toBe('unlimited');
    expect(productAt('2026-01-05T12:00:00+03:00')).toBe('news');
  });

  it('не меняется в течение одних календарных суток по Москве', () => {
    const morning = productAt('2026-11-22T00:00:00+03:00');
    expect(productAt('2026-11-22T12:00:00+03:00')).toBe(morning);
    expect(productAt('2026-11-22T23:59:59.999+03:00')).toBe(morning);
  });

  it('переключается ровно в полночь по Москве', () => {
    expect(productAt('2026-11-22T23:59:59.999+03:00')).toBe('tech');
    expect(productAt('2026-11-23T00:00:00+03:00')).toBe('invest');
  });

  it('использует сутки по Москве, а не UTC: в 22:30 UTC в Москве уже следующий день', () => {
    expect(productAt('2026-11-22T20:59:59Z')).toBe('tech');
    expect(productAt('2026-11-22T21:00:00Z')).toBe('invest');
  });

  it('обрабатывает даты до эпохи без отрицательных индексов', () => {
    expect(productAt('2025-12-31T12:00:00+03:00')).toBe('unlimited');
  });

  it('возвращает закреплённый продукт независимо от дня', () => {
    const selection = selectShowcaseProduct({
      now: new Date('2026-11-22T12:00:00+03:00'),
      settings: { mode: 'pinned', productId: 'unlimited' },
      rotation: ROTATION,
    });
    expect(selection).toEqual({ kind: 'pinned', productId: 'unlimited' });
  });

  it('возвращается к ротации, если закреплённый продукт неизвестен', () => {
    const selection = selectShowcaseProduct({
      now: new Date('2026-11-22T12:00:00+03:00'),
      settings: { mode: 'pinned', productId: 'the-bell-pro' },
      rotation: ROTATION,
    });
    expect(selection?.kind).toBe('rotation-fallback');
    expect(selection?.productId).toBe('tech');
  });

  describe('с исключёнными продуктами (закреплены в другом месте страницы)', () => {
    function rotatingAt(now: string, exclude: readonly string[]): string | undefined {
      return selectShowcaseProduct({
        now: new Date(now),
        settings: { mode: 'rotation' },
        rotation: ROTATION,
        exclude,
      })?.productId;
    }
    const DAYS = ['23', '24', '25', '26', '27', '28', '29', '30'].map(
      (day) => `2026-11-${day}T12:00:00+03:00`,
    );

    it('перебирает оставшиеся продукты 8 дней подряд и ни разу не показывает исключённый', () => {
      expect(DAYS.map((day) => rotatingAt(day, ['unlimited']))).toEqual([
        'invest',
        'news',
        'tech',
        'invest',
        'news',
        'tech',
        'invest',
        'news',
      ]);
    });

    it('по-прежнему переключается ровно в полночь по Москве', () => {
      expect(rotatingAt('2026-11-23T20:59:59.999Z', ['unlimited'])).toBe('invest');
      expect(rotatingAt('2026-11-23T21:00:00Z', ['unlimited'])).toBe('news');
    });

    it('игнорирует неизвестные id в списке исключений', () => {
      expect(DAYS.map((day) => rotatingAt(day, ['the-bell-pro']))).toEqual(
        DAYS.map((day) => productAt(day)),
      );
    });

    it('применяет исключения к ротации, которая заменяет неизвестное закрепление', () => {
      const selection = selectShowcaseProduct({
        now: new Date('2026-11-24T12:00:00+03:00'),
        settings: { mode: 'pinned', productId: 'the-bell-pro' },
        rotation: ROTATION,
        exclude: ['unlimited'],
      });
      expect(selection).toMatchObject({ kind: 'rotation-fallback', productId: 'news' });
    });

    it('не влияет на корректное закрепление', () => {
      const selection = selectShowcaseProduct({
        now: new Date('2026-11-24T12:00:00+03:00'),
        settings: { mode: 'pinned', productId: 'unlimited' },
        rotation: ROTATION,
        exclude: ['unlimited'],
      });
      expect(selection).toEqual({ kind: 'pinned', productId: 'unlimited' });
    });

    it('возвращает null, если исключены все продукты, вместо повтора одного из них', () => {
      expect(rotatingAt(DAYS[1], ['news', 'tech', 'invest', 'unlimited'])).toBeUndefined();
    });
  });

  it('возвращает null для пустого порядка или некорректной эпохи', () => {
    expect(productAt('2026-11-22T12:00:00+03:00', { ...ROTATION, order: [] })).toBeUndefined();
    expect(
      productAt('2026-11-22T12:00:00+03:00', { ...ROTATION, epochDay: '2026-02-30' }),
    ).toBeUndefined();
  });
});
