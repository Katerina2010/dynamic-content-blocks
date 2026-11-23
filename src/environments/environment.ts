/**
 * Production-сборка (опубликованная страница). Режим checkout всё равно можно переопределить
 * для конкретного открытия через `?checkout=demo` или `?checkout=live`.
 */
export const environment = {
  checkoutMode: 'live',
} as const;
