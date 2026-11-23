import { FormControl } from '@angular/forms';
import { cardNumberValidator, expiryValidator, testCardValidator } from './payment-validators';

describe('валидаторы формы оплаты', () => {
  // 22 ноября 2026 года, местное время.
  const validate = expiryValidator(() => new Date(2026, 10, 22, 12, 0));
  const expiry = (value: string): ReturnType<typeof validate> => validate(new FormControl(value));

  it('принимает карту, срок которой истекает в текущем месяце', () => {
    expect(expiry('11/26')).toBeNull();
  });

  it('отклоняет карту, срок которой истёк в прошлом месяце', () => {
    expect(expiry('10/26')).toEqual({ expired: true });
  });

  it('отклоняет карту с прошедшим годом, даже если месяц больше текущего', () => {
    expect(expiry('12/25')).toEqual({ expired: true });
  });

  it('принимает будущие даты, а некорректные помечает как ошибку формата', () => {
    expect(expiry('01/27')).toBeNull();
    expect(expiry('13/27')).toEqual({ expiry: true });
    expect(expiry('1/27')).toEqual({ expiry: true });
  });

  it('проверяет длину номера карты и контрольную сумму по алгоритму Луна', () => {
    expect(cardNumberValidator(new FormControl('4242 4242 4242 4242'))).toBeNull();
    expect(cardNumberValidator(new FormControl('4242 4242 4242 4241'))).toEqual({
      cardNumber: true,
    });
  });

  it('принимает только настроенные тестовые карты', () => {
    const testCard = testCardValidator(['4242 4242 4242 4242', '4000 0000 0000 0002']);
    expect(testCard(new FormControl('4242 4242 4242 4242'))).toBeNull();
    expect(testCard(new FormControl('4000000000000002'))).toBeNull();
    // Правдоподобный номер настоящей карты отклоняется.
    expect(cardNumberValidator(new FormControl('5555 5555 5555 4444'))).toBeNull();
    expect(testCard(new FormControl('5555 5555 5555 4444'))).toEqual({ unknownCard: true });
    // Неполный ввод оставлен проверке формата.
    expect(testCard(new FormControl('4242'))).toBeNull();
  });

  it('отклоняет месяц 00 и принимает месяц 12', () => {
    expect(expiry('00/27')).toEqual({ expiry: true });
    expect(expiry('12/27')).toBeNull();
  });
});
