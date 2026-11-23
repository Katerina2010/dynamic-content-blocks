import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

/**
 * Отмечает предка элемента, открывшего окно: этот предок забирает фокус,
 * если сам элемент исчез из DOM.
 */
const FOCUS_RETURN_ATTR = 'data-focus-return';
/** Внутри контейнера `data-focus-return`: предпочтительный элемент для фокуса. */
const FOCUS_RETURN_TARGET_ATTR = 'data-focus-return-target';

/**
 * Технический контейнер модального окна: оверлей, Esc, управление фокусом, aria и блокировка
 * прокрутки. Он ничего не знает о показываемом содержимом; когда его отрисовывать, решает
 * родитель.
 *
 * Нативный `<dialog>` и состояние родителя синхронизированы: пока модальное окно отрисовано,
 * диалог открыт. Браузеры могут закрыть диалог сами (например, Chrome закрывает его при
 * повторном Esc, даже если `cancel` отменён); тогда `close` превращается в запрос закрытия
 * или, если закрывать нельзя, диалог показывается снова.
 */
@Component({
  selector: 'app-modal-shell',
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // На уровне документа: во время оплаты форма недоступна, и фокус переходит на <body>.
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class ModalShellComponent implements AfterViewInit, OnDestroy {
  readonly labelledBy = input.required<string>();
  /**
   * Когда false, Esc, кнопка закрытия и клики по оверлею игнорируются
   * (например, во время оплаты).
   */
  readonly dismissible = input(true);
  readonly closeLabel = input('Закрыть');
  readonly dismissed = output();

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private opener: HTMLElement | null = null;
  private focusFallback: Element | null = null;
  private previousOverflow = '';
  private destroying = false;

  ngAfterViewInit(): void {
    const active = this.document.activeElement;
    this.opener = active instanceof HTMLElement ? active : null;
    this.focusFallback = this.opener?.closest(`[${FOCUS_RETURN_ATTR}]`) ?? null;
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.show();
  }

  ngOnDestroy(): void {
    this.destroying = true;
    this.document.body.style.overflow = this.previousOverflow;
    const dialog = this.dialog().nativeElement;
    if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
    this.restoreFocus();
  }

  /**
   * Esc, пока окно нельзя закрыть: отменяем само нажатие клавиши,
   * чтобы браузер не создавал запрос на закрытие.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.dismissible()) {
      event.preventDefault();
    }
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.requestDismiss();
  }

  /** Диалог закрыл браузер, а не родитель, удаливший модальное окно. */
  protected onNativeClose(): void {
    if (this.destroying) {
      return;
    }
    if (!this.dismissible()) {
      this.show();
      return;
    }
    this.dismissed.emit();
    // Если родитель всё же оставил модальное окно, диалог приводится в соответствие с этим.
    afterNextRender(
      () => {
        if (!this.destroying) {
          this.show();
        }
      },
      { injector: this.injector },
    );
  }

  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.requestDismiss();
    }
  }

  protected requestDismiss(): void {
    if (this.dismissible()) {
      this.dismissed.emit();
    }
  }

  private show(): void {
    const dialog = this.dialog().nativeElement;
    if (typeof dialog.showModal === 'function' && !dialog.open) {
      dialog.showModal();
    }
  }

  /**
   * Возврат на элемент, открывший окно; если его нет (например, CTA заменён статусом),
   * то на его контейнер.
   */
  private restoreFocus(): void {
    if (this.opener?.isConnected) {
      this.opener.focus();
      return;
    }
    if (!this.focusFallback?.isConnected) {
      return;
    }
    const target =
      this.focusFallback.querySelector(`[${FOCUS_RETURN_TARGET_ATTR}]`) ?? this.focusFallback;
    if (target instanceof HTMLElement) {
      target.focus();
    }
  }
}
