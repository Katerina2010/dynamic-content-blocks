import { resolveCheckoutMode } from './resolve-checkout-mode';

describe('resolveCheckoutMode: выбор режима checkout', () => {
  it('без параметра использует режим по умолчанию, заданный окружением', () => {
    expect(resolveCheckoutMode('', 'live')).toBe('live');
    expect(resolveCheckoutMode('?demoNow=2026-11-22', 'demo')).toBe('demo');
  });

  it('позволяет ?checkout=demo и ?checkout=live переопределить режим по умолчанию', () => {
    expect(resolveCheckoutMode('?checkout=demo', 'live')).toBe('demo');
    expect(resolveCheckoutMode('?demoNow=x&checkout=live', 'demo')).toBe('live');
  });

  it('игнорирует неизвестные значения, не пытаясь угадать режим', () => {
    expect(resolveCheckoutMode('?checkout=prod', 'live')).toBe('live');
    expect(resolveCheckoutMode('?checkout=', 'demo')).toBe('demo');
  });
});
