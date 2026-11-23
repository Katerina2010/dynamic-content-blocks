import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ARTICLES } from '../../../data/sources/articles.data';
import { ArticleCardComponent } from './article-card.component';

describe('ArticleCardComponent: карточка статьи', () => {
  let fixture: ComponentFixture<ArticleCardComponent>;
  const article = ARTICLES[0];

  async function render(emphasis: 'hero' | 'cover' | 'text'): Promise<HTMLElement> {
    fixture = TestBed.createComponent(ArticleCardComponent);
    fixture.componentRef.setInput('article', article);
    fixture.componentRef.setInput('emphasis', emphasis);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  for (const emphasis of ['hero', 'cover', 'text'] as const) {
    it(`делает заголовок варианта ${emphasis} единственной ссылкой на статью в новой вкладке`, async () => {
      const root = await render(emphasis);
      const links = root.querySelectorAll<HTMLAnchorElement>('a');
      expect(links).toHaveLength(1);
      const link = links[0];
      expect(link.closest('h2')).not.toBeNull();
      expect(link.getAttribute('href')).toBe(article.url);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener');
      expect(link.textContent).toContain(article.title);
      expect(link.textContent).toContain('откроется в новой вкладке');
    });
  }
});
