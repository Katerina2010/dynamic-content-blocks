import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CLOCK } from '../../../../shared/time/clock.token';
import { ProductShowcaseView } from '../models/product-showcase-view.interface';
import { ProductId } from '../models/product-id.type';
import { ShowcaseSettings } from '../models/showcase-settings.type';
import { Tariff } from '../models/tariff.interface';
import { describePrice } from '../rules/describe-price';
import { selectShowcaseProduct } from '../rules/select-showcase-product';
import { ENTITLEMENT_QUERY } from '../tokens/entitlement-query.token';
import { PRODUCT_CATALOG } from '../tokens/product-catalog.token';
import { ROTATION_CONFIG } from '../tokens/rotation-config.token';
import { SUBSCRIPTION_CHECKOUT } from '../tokens/subscription-checkout.token';

const BADGE_BY_SELECTION = {
  pinned: 'Выбор редакции',
  rotation: 'Продукт дня',
  'rotation-fallback': 'Продукт дня',
} as const;

@Injectable()
export class ProductShowcaseFacade {
  private readonly catalog = inject(PRODUCT_CATALOG);
  private readonly rotation = inject(ROTATION_CONFIG);
  private readonly checkout = inject(SUBSCRIPTION_CHECKOUT);
  private readonly access = inject(ENTITLEMENT_QUERY);
  private readonly clock = inject(CLOCK);

  /** Пересчитывается каждый тик, поэтому продукт меняется в местную полночь без перезагрузки. */
  private readonly now = toSignal(this.clock.ticks(this.rotation.refreshIntervalMs), {
    initialValue: this.clock.now(),
  });

  /**
   * Реактивен при вызове внутри `computed()`: зависит от часов и от покупок.
   * `rotationExclude`: продукты, которые ротация должна пропустить (закреплены в другом месте
   * страницы).
   */
  viewFor(
    settings: ShowcaseSettings,
    rotationExclude: readonly string[] = [],
  ): ProductShowcaseView | null {
    const selection = selectShowcaseProduct({
      now: this.now(),
      settings,
      rotation: this.rotation,
      exclude: rotationExclude,
    });
    if (!selection) {
      return null;
    }
    const product = this.catalog.product(selection.productId);
    if (!product) {
      return null;
    }

    const tariffs = this.catalog.tariffsOf(product.id);
    const ownedTariffs = tariffs.filter((tariff) => this.access.ownedTariffIds().has(tariff.id));
    const owned = ownedTariffs.length > 0;
    // Пробный тариф сам по себе — не весь продукт: так и сообщаем,
    // а CTA по-прежнему ведёт к платным тарифам.
    const trialOnly = owned && ownedTariffs.every((tariff) => tariff.kind === 'trial');
    const included = !owned && this.coveredByOwnedAccess(tariffs);
    const offerTariff = this.offerTariff(tariffs);
    const untilReload = this.access.purchasesPersisted() ? '' : ' до перезагрузки страницы';

    return {
      product,
      selection: selection.kind,
      badge: BADGE_BY_SELECTION[selection.kind],
      offer: offerTariff ? describePrice(offerTariff) : null,
      owned,
      ownedLabel: `${trialOnly ? 'Оформлен пробный тариф' : 'Подписка оформлена'}${untilReload}`,
      includedLabel: included ? `Доступ уже включён в вашу подписку${untilReload}` : null,
      ctaLabel: owned || included ? 'Тарифы и ваша подписка' : 'Оформить подписку',
    };
  }

  subscribe(productId: ProductId): void {
    this.checkout.open({ kind: 'product', productId });
  }

  /** True, когда каждое право каждого тарифа продукта уже есть у читателя. */
  private coveredByOwnedAccess(tariffs: readonly Tariff[]): boolean {
    const entitlements = this.access.entitlements();
    return (
      tariffs.length > 0 &&
      tariffs.every((tariff) => tariff.grants.every((grant) => entitlements.has(grant)))
    );
  }

  /** Пробный тариф, если он есть у продукта, иначе ежемесячный. Никогда не «первый в массиве». */
  private offerTariff(tariffs: readonly Tariff[]): Tariff | undefined {
    return (
      tariffs.find((tariff) => tariff.kind === 'trial') ??
      tariffs.find((tariff) => tariff.kind === 'recurring' && tariff.period === 'month')
    );
  }
}
