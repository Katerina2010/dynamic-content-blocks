import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WebinarCardView } from '../../../core/models/webinar-card-view.interface';

@Component({
  selector: 'app-webinar-card',
  templateUrl: './webinar-card.component.html',
  styleUrl: './webinar-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebinarCardComponent {
  readonly card = input.required<WebinarCardView>();
  readonly accessRequested = output<string>();
}
