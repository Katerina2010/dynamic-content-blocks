import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutFacade } from '../../../core/facades/checkout.facade';
import { CheckoutSelection } from '../../../core/models/checkout-selection.interface';
import { CheckoutState } from '../../../core/models/checkout-state.type';
import { OFFICIAL_CHECKOUTS } from '../../../bootstrap/configuration/checkout.config';
import { RedirectStepComponent } from './redirect-step.component';

function selection(productId: 'tech' | 'unlimited', priceLabel: string): CheckoutSelection {
  return {
    priceLabel,
    product: {
      id: productId,
      name: productId === 'tech' ? 'The Bell.Tech' : 'The Bell.Unlimited',
      sourceUrl: `https://subscription.thebell.io/${productId}`,
    },
    tariff: { title: 'Пробный' },
  } as unknown as CheckoutSelection;
}

describe('RedirectStepComponent (Live): переход на официальную оплату', () => {
  let fixture: ComponentFixture<RedirectStepComponent>;

  async function render(state: CheckoutState, picked: CheckoutSelection): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CheckoutFacade,
          useValue: {
            state: signal(state),
            selection: signal(picked),
            backToTariffs: () => undefined,
          },
        },
      ],
    });
    fixture = TestBed.createComponent(RedirectStepComponent);
    fixture.componentRef.setInput('titleId', 'title');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('ведёт на официальный checkout в новой вкладке, показывает обе цены и не запрашивает карту', async () => {
    const trial = OFFICIAL_CHECKOUTS['tech-trial'];
    const root = await render(
      {
        step: 'redirect',
        request: { kind: 'product', productId: 'tech' },
        tariffId: 'tech-trial',
        checkout: trial,
      },
      selection('tech', '$1 за первый месяц, далее $14,90 в месяц'),
    );
    const link = root.querySelector<HTMLAnchorElement>('a.btn--primary');
    expect(link?.getAttribute('href')).toBe(trial.url);
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(root.textContent).toContain('$1 за первый месяц, далее $14,90 в месяц');
    expect(root.textContent).toContain('$1,01/месяц сейчас, затем $14,90/месяц');
    expect(root.querySelectorAll('input').length).toBe(0);
    expect(root.textContent).not.toContain('Подписка оформлена');
    expect(root.querySelector('.terms')?.textContent).toContain(
      'участие в вебинарах и полный архив материалов и вебинаров The Bell.Tech будут доступны со 2-го месяца',
    );
  });

  it('показывает условия пробного тарифа Invest и обе цены до перехода', async () => {
    const trial = OFFICIAL_CHECKOUTS['invest-trial'];
    const root = await render(
      {
        step: 'redirect',
        request: { kind: 'product', productId: 'invest' },
        tariffId: 'invest-trial',
        checkout: trial,
      },
      selection('tech', '$1 за первый месяц, далее $18,90 в месяц'),
    );
    expect(root.querySelector('a.btn--primary')?.getAttribute('href')).toBe(
      'https://thebell.io/checkout/7h6fe4e9e9195b2903372640046e01731d7fba',
    );
    expect(root.textContent).toContain('$1/месяц сейчас, затем $18,90/месяц');
    expect(root.querySelector('.terms')?.textContent).toContain('The Bell.Invest');
    expect(root.querySelector('.terms')?.textContent).toContain('со 2-го месяца');
  });

  it('не показывает условия пробного тарифа для обычного тарифа', async () => {
    const root = await render(
      {
        step: 'redirect',
        request: { kind: 'product', productId: 'tech' },
        tariffId: 'tech-monthly',
        checkout: OFFICIAL_CHECKOUTS['tech-monthly'],
      },
      selection('tech', '$14,90 в месяц'),
    );
    expect(root.querySelector('.terms')).toBeNull();
    expect(root.textContent).toContain('$14,90/месяц');
  });

  it('без проверенного URL: честное сообщение и страница продукта, без ссылки на оплату', async () => {
    const root = await render(
      {
        step: 'redirect',
        request: { kind: 'product', productId: 'unlimited' },
        tariffId: 'unlimited-monthly',
        checkout: null,
      },
      selection('unlimited', '$39 в месяц'),
    );
    expect(root.textContent).toContain('пока не подтверждена');
    expect(root.querySelector('a.btn--primary')).toBeNull();
    expect(root.querySelector('a.btn--secondary')?.getAttribute('href')).toBe(
      'https://subscription.thebell.io/unlimited',
    );
  });
});
