/** Formatting helpers. */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert Latin digits in a value to Persian digits. */
export function toFaDigits(input) {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}
