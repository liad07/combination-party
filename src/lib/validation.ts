export class InputValidation {
  static digits(value: string, minimum = 1, maximum = 10): string {
    if (value.length < minimum || value.length > maximum) {
      throw new RangeError(`נדרשות ${minimum} עד ${maximum} ספרות`);
    }
    if (!/^\d+$/.test(value)) {
      throw new TypeError("הקלט חייב להכיל ספרות בלבד");
    }
    return value;
  }

  static targetLength(targetLength: number, inputLength: number): number {
    if (!Number.isInteger(targetLength) || targetLength < 0 || targetLength > inputLength) {
      throw new RangeError("אורך היעד חייב להיות מספר שלם בין 0 לאורך הקלט");
    }
    return targetLength;
  }
}
