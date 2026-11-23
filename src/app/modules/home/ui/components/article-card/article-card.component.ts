import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Article } from '../../../core/models/article.interface';
import { ArticlePresentation } from '../../../core/models/grid-item-config.type';

/** Тон обложки по рубрике. Обложки генерирует CSS: фото не копируются и не придумываются. */
const TONE_BY_RUBRIC: Readonly<Record<string, string>> = {
  Истории: 'story',
  'Итоги недели': 'weekly',
  'Утренняя рассылка': 'morning',
  'The Bell.Tech': 'tech',
  'The Bell.Invest': 'invest',
};

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
  readonly emphasis = input<ArticlePresentation>('text');

  protected readonly tone = computed(() => TONE_BY_RUBRIC[this.article().rubric] ?? 'news');
}
