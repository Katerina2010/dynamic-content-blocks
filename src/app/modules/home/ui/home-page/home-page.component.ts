import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductShowcaseBlockComponent } from '../../../products/ui/product-showcase-block/product-showcase-block.component';
import { WebinarsBlockComponent } from '../../../webinars/ui/webinars-block/webinars-block.component';
import { HomeGridFacade } from '../../core/facades/home-grid.facade';
import { ArticleCardComponent } from '../components/article-card/article-card.component';
import { SiteHeaderComponent } from '../components/site-header/site-header.component';

/**
 * Фрагмент главной страницы: отрисовывает редакторскую сетку;
 * каждому типу слота соответствует один компонент.
 */
@Component({
  selector: 'app-home-page',
  imports: [
    SiteHeaderComponent,
    ArticleCardComponent,
    ProductShowcaseBlockComponent,
    WebinarsBlockComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  protected readonly items = inject(HomeGridFacade).items;
}
