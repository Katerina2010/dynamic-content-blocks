import { CardInputField, maskCardInput } from './card-input-mask';

/** Имитирует состояние браузера после правки: `|` отмечает позицию курсора. */
function edit(field: CardInputField, valueWithCaret: string, inserting = true): string {
  const caret = valueWithCaret.indexOf('|');
  const value = valueWithCaret.replace('|', '');
  const result = maskCardInput({ field, value, caret, inserting });
  return `${result.value.slice(0, result.caret)}|${result.value.slice(result.caret)}`;
}

describe('maskCardInput: маски полей карты', () => {
  describe('номер карты', () => {
    it('оставляет только цифры и группирует их по четыре', () => {
      expect(edit('cardNumber', '4242a42-42|')).toBe('4242 4242|');
      expect(edit('cardNumber', '42424242424242|')).toBe('4242 4242 4242 42|');
    });

    it('ограничивает номер 16 цифрами, в том числе при вставке более длинного текста', () => {
      expect(edit('cardNumber', '4242 4242 4242 4242 99|')).toBe('4242 4242 4242 4242|');
      expect(edit('cardNumber', 'Card: 4000-0000-0000-0002, exp 12/30|')).toBe(
        '4000 0000 0000 0002|',
      );
    });

    it('при правке в середине оставляет курсор после той же цифры', () => {
      // Введена цифра "9" после второй цифры в "4242 4242".
      expect(edit('cardNumber', '429|42 4242')).toBe('429|4 2424 2');
      // Удалена цифра перед курсором во второй группе.
      expect(edit('cardNumber', '4242 42|2', false)).toBe('4242 42|2');
    });

    it('корректно обрабатывает удаление всего значения', () => {
      expect(edit('cardNumber', '|', false)).toBe('|');
    });
  });

  describe('срок действия', () => {
    it('добавляет слэш после месяца при вводе и ограничивает значение четырьмя цифрами', () => {
      expect(edit('expiry', '1|')).toBe('1|');
      expect(edit('expiry', '12|')).toBe('12/|');
      expect(edit('expiry', '12/2|')).toBe('12/2|');
      expect(edit('expiry', '12/289|')).toBe('12/28|');
    });

    it('форматирует вставленные цифры и убирает остальные символы', () => {
      expect(edit('expiry', '1228|')).toBe('12/28|');
      expect(edit('expiry', '12 / 28|')).toBe('12/28|');
    });

    it('берёт из вставленного четырёхзначного года две последние цифры', () => {
      expect(edit('expiry', '12 / 2029|')).toBe('12/29|');
      expect(edit('expiry', '122029|')).toBe('12/29|');
    });

    it('позволяет Backspace удалить слэш, не добавляя его снова', () => {
      expect(edit('expiry', '12|', false)).toBe('12|');
      expect(edit('expiry', '1|', false)).toBe('1|');
    });

    it('перераспределяет цифры при удалении одной из них в середине', () => {
      expect(edit('expiry', '1|/28', false)).toBe('1|2/8');
    });
  });

  describe('код CVC', () => {
    it('оставляет только цифры, не больше трёх', () => {
      expect(edit('cvc', '1a2|')).toBe('12|');
      expect(edit('cvc', '12345|')).toBe('123|');
    });
  });
});
