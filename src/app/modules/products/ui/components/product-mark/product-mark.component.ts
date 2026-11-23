import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProductId } from '../../../core/models/product-id.type';

/** Сгенерированный типографский знак продукта (без копирования фирменных изображений). */
@Component({
  selector: 'app-product-mark',
  templateUrl: './product-mark.component.html',
  styleUrl: './product-mark.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductMarkComponent {
  readonly productId = input.required<ProductId>();
  readonly label = input.required<string>();
}
