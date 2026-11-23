import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ProductShowcaseFacade } from '../../core/facades/product-showcase.facade';
import { ProductId } from '../../core/models/product-id.type';
import { ShowcaseSettings } from '../../core/models/showcase-settings.type';
import { ProductMarkComponent } from '../components/product-mark/product-mark.component';

/** Блок сетки: продукт дня (или закреплённый редактором продукт) с CTA оформления подписки. */
@Component({
  selector: 'app-product-showcase-block',
  imports: [ProductMarkComponent],
  templateUrl: './product-showcase-block.component.html',
  styleUrl: './product-showcase-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductShowcaseBlockComponent {
  readonly blockId = input.required<string>();
  readonly settings = input.required<ShowcaseSettings>();
  /**
   * Продукты, которые ротация должна пропустить, например закреплённые в других слотах
   * той же страницы.
   */
  readonly rotationExclude = input<readonly string[]>([]);

  private readonly facade = inject(ProductShowcaseFacade);

  protected readonly view = computed(() =>
    this.facade.viewFor(this.settings(), this.rotationExclude()),
  );
  protected readonly headingId = computed(() => `${this.blockId()}-title`);

  protected subscribe(productId: ProductId): void {
    this.facade.subscribe(productId);
  }
}
