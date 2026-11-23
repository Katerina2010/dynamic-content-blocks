import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CLOCK } from '../../../../shared/time/clock.token';
import { EntitlementId } from '../../../products/core/models/entitlement-id.type';
import { ENTITLEMENT_QUERY } from '../../../products/core/tokens/entitlement-query.token';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { SUBSCRIPTION_CHECKOUT } from '../../../products/core/tokens/subscription-checkout.token';
import { WebinarCta } from '../models/webinar-cta.type';
import { WebinarCardView } from '../models/webinar-card-view.interface';
import { WebinarsShowcaseSettings } from '../models/webinars-showcase-settings.type';
import { describeRecording } from '../rules/describe-recording';
import { resolveWebinarCta } from '../rules/resolve-webinar-cta';
import { selectWebinars } from '../rules/select-webinars';
import { WEBINARS_REFRESH_INTERVAL_MS } from '../tokens/webinars-refresh-interval.token';
import { WEBINARS_REPOSITORY } from '../tokens/webinars-repository.token';

const STATUS_LABEL = { upcoming: 'Скоро', started: 'Эфир начался', past: 'Прошёл' } as const;

@Injectable()
export class WebinarsShowcaseFacade {
  private readonly repository = inject(WEBINARS_REPOSITORY);
  private readonly catalog = inject(PRODUCT_CATALOG);
  private readonly access = inject(ENTITLEMENT_QUERY);
  private readonly checkout = inject(SUBSCRIPTION_CHECKOUT);
  private readonly clock = inject(CLOCK);

  private readonly now = toSignal(this.clock.ticks(inject(WEBINARS_REFRESH_INTERVAL_MS)), {
    initialValue: this.clock.now(),
  });

  /** Реактивен при вызове внутри `computed()`: зависит от часов и от покупок. */
  cardsFor(settings: WebinarsShowcaseSettings): readonly WebinarCardView[] {
    const owned = this.access.entitlements();
    const isSellable = (entitlement: EntitlementId): boolean =>
      this.catalog.tariffsGranting(entitlement).length > 0;

    return selectWebinars({
      webinars: this.repository.all(),
      settings,
      now: this.now(),
    }).map(({ webinar, status }) => ({
      id: webinar.id,
      title: webinar.title,
      series: webinar.series,
      seriesLabel: webinar.seriesLabel,
      dateLabel: webinar.schedule.label,
      speakers: webinar.speakers,
      status,
      statusLabel: STATUS_LABEL[status],
      recordingNote: describeRecording(webinar.recording, status),
      cta: this.withPersistenceWarning(resolveWebinarCta({ webinar, status, owned, isSellable })),
      sourceUrl: webinar.sourceUrl,
    }));
  }

  private withPersistenceWarning(cta: WebinarCta): WebinarCta {
    if (cta.kind !== 'granted' || this.access.purchasesPersisted()) {
      return cta;
    }
    return { kind: 'granted', note: `${cta.note} (до перезагрузки страницы)` };
  }

  /**
   * Открывает checkout для права, которое сейчас нужно этому вебинару. CTA вычисляется здесь
   * заново, поэтому устаревший или подделанный вызов не может открыть checkout для вебинара,
   * который не продаётся.
   */
  requestAccess(webinarId: string): void {
    const webinar = this.repository.all().find((candidate) => candidate.id === webinarId);
    if (webinar?.access.kind !== 'entitlement') {
      return;
    }
    const card = this.cardsFor({ rule: 'manual', webinarIds: [webinarId] }).at(0);
    if (card?.cta.kind !== 'request-access') {
      return;
    }
    this.checkout.open({
      kind: 'entitlement',
      entitlement: card.cta.entitlement,
      contextProductId: webinar.access.productId,
      reason: `Вебинар «${webinar.title}»`,
      // Только до начала: обещание письма неверно для записи уже прошедшего события.
      subscriberNote:
        card.status === 'upcoming' ? this.subscriberNote(card.cta.entitlement) : undefined,
    });
  }

  /**
   * Как на официальной странице вебинара: подписчики получают ссылку на почту примерно за час
   * до начала. Названия продуктов берутся из тарифов, которые дают право (например, Tech
   * или Unlimited).
   */
  private subscriberNote(entitlement: EntitlementId): string {
    const productIds = new Set(
      this.catalog.tariffsGranting(entitlement).map((tariff) => tariff.productId),
    );
    const names = [...productIds].flatMap((id) => this.catalog.product(id)?.name ?? []);
    return `Уже подписаны на ${names.join(' или ')}? Повторная покупка не нужна: ссылка на вебинар придёт на почту примерно за час до начала.`;
  }
}
