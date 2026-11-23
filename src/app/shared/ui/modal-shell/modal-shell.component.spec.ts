import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalShellComponent } from './modal-shell.component';

/**
 * В jsdom нет поддержки модальных диалогов:
 * эмулируем `showModal`/`close` так, как ведут себя браузеры.
 */
function emulateDialog(): void {
  const proto = HTMLDialogElement.prototype;
  proto.showModal = function showModal(this: HTMLDialogElement): void {
    this.setAttribute('open', '');
  };
  proto.close = function close(this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) {
      return;
    }
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

@Component({
  imports: [ModalShellComponent],
  template: `
    <div data-focus-return>
      <p id="fallback" tabindex="-1" data-focus-return-target>Статус</p>
      @if (showOpener()) {
        <button id="opener" type="button">Открыть</button>
      }
    </div>
    @if (shown()) {
      <app-modal-shell
        labelledBy="title"
        [dismissible]="dismissible()"
        (dismissed)="dismissCount = dismissCount + 1; shown.set(false)"
      >
        <h2 id="title">Окно</h2>
      </app-modal-shell>
    }
  `,
})
class HostComponent {
  readonly shown = signal(false);
  readonly dismissible = signal(true);
  readonly showOpener = signal(true);
  dismissCount = 0;
}

describe('ModalShellComponent: модальное окно', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const dialog = (): HTMLDialogElement | null =>
    (fixture.nativeElement as HTMLElement).querySelector('dialog');
  const byId = (id: string): HTMLElement | null =>
    (fixture.nativeElement as HTMLElement).querySelector(`#${id}`);

  async function open(dismissible: boolean): Promise<void> {
    byId('opener')?.focus();
    host.dismissible.set(dismissible);
    host.shown.set(true);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    emulateDialog();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement as HTMLElement);
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
    document.body.style.overflow = '';
  });

  it('открывает нативный диалог и блокирует прокрутку страницы', async () => {
    await open(true);
    expect(dialog()?.hasAttribute('open')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('поглощает Esc, пока окно нельзя закрыть, поэтому браузер не получает запрос на закрытие', async () => {
    await open(false);
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    // Пока форма оплаты недоступна, фокус находится на <body>.
    document.body.dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(true);
  });

  it('снова открывает диалог, который браузер закрыл, пока закрывать было нельзя (повторный Esc)', async () => {
    await open(false);
    dialog()?.close();
    await fixture.whenStable();
    expect(dialog()?.hasAttribute('open')).toBe(true);
    expect(host.dismissCount).toBe(0);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('превращает закрытие браузером в запрос закрытия, если оно разрешено, а затем разблокирует прокрутку', async () => {
    await open(true);
    dialog()?.close();
    await fixture.whenStable();
    expect(host.dismissCount).toBe(1);
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('может быть снова открыт после закрытия браузером', async () => {
    await open(true);
    dialog()?.close();
    await fixture.whenStable();
    await open(true);
    expect(dialog()?.hasAttribute('open')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('после закрытия возвращает фокус на элемент, который открыл окно', async () => {
    await open(true);
    host.shown.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(byId('opener'));
  });

  it('переводит фокус на отмеченную цель, если открывший элемент исчез из DOM', async () => {
    await open(true);
    host.showOpener.set(false);
    await fixture.whenStable();
    host.shown.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(byId('fallback'));
  });
});
