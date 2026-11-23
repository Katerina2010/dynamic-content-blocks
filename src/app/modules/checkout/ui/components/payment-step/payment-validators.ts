import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const CARD_DIGITS = 16;
const EXPIRY = /^(\d{2})\s*\/\s*(\d{2})$/;
const MONTHS_IN_YEAR = 12;
const CENTURY = 2000;
const DOUBLED_DIGIT_LIMIT = 9;

function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > DOUBLED_DIGIT_LIMIT) {
        digit -= DOUBLED_DIGIT_LIMIT;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** Валидаторы формата для демо-формы карты. Никаких бизнес-правил они не содержат. */
export const cardNumberValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const digits = String(control.value).replace(/\s/g, '');
  if (!/^\d+$/.test(digits) || digits.length !== CARD_DIGITS || !passesLuhn(digits)) {
    return { cardNumber: true };
  }
  return null;
};

/**
 * Безопасность демо: принимаются только настроенные номера тестовых карт (`{ unknownCard }`),
 * поэтому данные настоящей карты никогда не нужны. Выполняется после проверки формата;
 * некорректные номера оставлены ей.
 */
export function testCardValidator(testNumbers: readonly string[]): ValidatorFn {
  const allowed = new Set(testNumbers.map((number) => number.replace(/\D/g, '')));
  return (control: AbstractControl): ValidationErrors | null => {
    const digits = String(control.value).replace(/\D/g, '');
    if (digits.length !== CARD_DIGITS) {
      return null;
    }
    return allowed.has(digits) ? null : { unknownCard: true };
  };
}

/**
 * Срок действия MM/YY. `{ expiry }` — для некорректного значения, `{ expired }` — когда месяц
 * карты уже прошёл: карта действует до последнего дня месяца окончания срока по местному
 * времени читателя.
 */
export function expiryValidator(now: () => Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const match = EXPIRY.exec(String(control.value).trim());
    const month = match ? Number(match[1]) : 0;
    if (!match || month < 1 || month > MONTHS_IN_YEAR) {
      return { expiry: true };
    }
    const year = CENTURY + Number(match[2]);
    const today = now();
    const current = today.getFullYear() * MONTHS_IN_YEAR + today.getMonth();
    const expires = year * MONTHS_IN_YEAR + (month - 1);
    return expires < current ? { expired: true } : null;
  };
}
