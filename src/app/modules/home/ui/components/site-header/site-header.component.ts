import { ChangeDetectionStrategy, Component } from '@angular/core';

interface NavLink {
  readonly label: string;
  readonly href: string;
}

const NAV: readonly NavLink[] = [
  { label: 'Главное', href: 'https://thebell.io/' },
  { label: 'Новости', href: 'https://thebell.io/category/news' },
  { label: 'Экономика', href: 'https://thebell.io/tag/ekonomika' },
  { label: 'Технологии', href: 'https://thebell.io/tag/tehnologii' },
  { label: 'Бизнес', href: 'https://thebell.io/tag/biznes' },
  { label: 'Инвестиции', href: 'https://thebell.io/category/bell-investitsii' },
];

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent {
  protected readonly nav = NAV;
}
