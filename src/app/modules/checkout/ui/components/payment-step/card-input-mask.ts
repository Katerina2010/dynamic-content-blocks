/** Какое поле демо-карты маскируется. */
export type CardInputField = 'cardNumber' | 'expiry' | 'cvc';

export interface MaskInput {
  readonly field: CardInputField;
  /** Исходное значение после того, как браузер применил правку (ввод, вставка, удаление). */
  readonly value: string;
  /** Позиция курсора в `value`. */
  readonly caret: number;
  /** True, если правка вставила текст; false — при удалении. */
  readonly inserting: boolean;
}

export interface MaskResult {
  readonly value: string;
  readonly caret: number;
}

const MAX_DIGITS: Readonly<Record<CardInputField, number>> = {
  cardNumber: 16,
  expiry: 4,
  cvc: 3,
};
const CARD_GROUP = 4;
const MONTH_DIGITS = 2;
/** MMYYYY, например вставленное "12/2029": сохраняем месяц и две последние цифры года. */
const EXPIRY_WITH_FULL_YEAR = 6;

function format(field: CardInputField, digits: string, inserting: boolean): string {
  if (field === 'cardNumber') {
    return (digits.match(new RegExp(`.{1,${String(CARD_GROUP)}}`, 'g')) ?? []).join(' ');
  }
  if (field === 'expiry') {
    if (digits.length > MONTH_DIGITS) {
      return `${digits.slice(0, MONTH_DIGITS)}/${digits.slice(MONTH_DIGITS)}`;
    }
    // Ввод второй цифры месяца добавляет слэш; удаление никогда не добавляет его снова.
    return digits.length === MONTH_DIGITS && inserting ? `${digits}/` : digits;
  }
  return digits;
}

/** Индекс сразу после `count`-й цифры в `value` (0 → начало строки). */
function caretAfterDigits(value: string, count: number): number {
  if (count === 0) {
    return 0;
  }
  let seen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      seen += 1;
      if (seen === count) {
        return index + 1;
      }
    }
  }
  return value.length;
}

/**
 * Форматирует поле демо-карты: оставляет только цифры, ограничивает их количество (16 / 4 / 3),
 * группирует номер карты по четыре и записывает срок как MM/YY. Курсор остаётся после той же
 * цифры, что и до форматирования, поэтому вставка, удаление и правка в середине ведут себя
 * естественно.
 */
export function maskCardInput(input: MaskInput): MaskResult {
  const { field, value, caret, inserting } = input;
  const max = MAX_DIGITS[field];
  const allDigits = value.replace(/\D/g, '');
  const digits =
    field === 'expiry' && allDigits.length === EXPIRY_WITH_FULL_YEAR
      ? `${allDigits.slice(0, MONTH_DIGITS)}${allDigits.slice(-MONTH_DIGITS)}`
      : allDigits.slice(0, max);
  const digitsBeforeCaret = Math.min(value.slice(0, caret).replace(/\D/g, '').length, max);

  const atEnd = digitsBeforeCaret === digits.length;
  const formatted = format(field, digits, inserting && atEnd);
  const nextCaret = atEnd ? formatted.length : caretAfterDigits(formatted, digitsBeforeCaret);
  return { value: formatted, caret: nextCaret };
}
