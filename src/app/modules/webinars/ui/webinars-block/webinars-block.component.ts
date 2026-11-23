import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { WebinarsShowcaseFacade } from '../../core/facades/webinars-showcase.facade';
import { WebinarsShowcaseSettings } from '../../core/models/webinars-showcase-settings.type';
import { WebinarCardComponent } from '../components/webinar-card/webinar-card.component';
import { WebinarFeatureComponent } from '../components/webinar-feature/webinar-feature.component';

/**
 * Блок сетки: предстоящие и прошедшие вебинары с CTA с учётом прав читателя —
 * в виде крупной карточки или строки.
 */
@Component({
  selector: 'app-webinars-block',
  imports: [WebinarCardComponent, WebinarFeatureComponent],
  templateUrl: './webinars-block.component.html',
  styleUrl: './webinars-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebinarsBlockComponent {
  readonly blockId = input.required<string>();
  readonly title = input.required<string>();
  /** `feature`: одна большая карточка с обложкой; `list`: строка компактных элементов. */
  readonly presentation = input<'feature' | 'list'>('list');
  readonly settings = input.required<WebinarsShowcaseSettings>();

  private readonly facade = inject(WebinarsShowcaseFacade);

  protected readonly cards = computed(() => this.facade.cardsFor(this.settings()));
  protected readonly headingId = computed(() => `${this.blockId()}-title`);

  protected requestAccess(webinarId: string): void {
    this.facade.requestAccess(webinarId);
  }
}
