/** Formatting helpers. */

import { getLang } from "../i18n/index.js";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Localized digits: converts Latin digits to Persian when the active
 * language is fa; otherwise returns the value unchanged.
 */
export function toFaDigits(input) {
  if (getLang() !== "fa") return String(input);
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}
