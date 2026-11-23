import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { WebinarCardView } from '../../../core/models/webinar-card-view.interface';

/** Большая редакторская карточка одного вебинара: серия, статус, дата, спикеры и CTA. */
@Component({
  selector: 'app-webinar-feature',
  templateUrl: './webinar-feature.component.html',
  styleUrl: './webinar-feature.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebinarFeatureComponent {
  readonly card = input.required<WebinarCardView>();
  readonly accessRequested = output<string>();

  protected readonly speakerNames = computed(() =>
    this.card()
      .speakers.map((speaker) => speaker.name)
      .join(', '),
  );
}
