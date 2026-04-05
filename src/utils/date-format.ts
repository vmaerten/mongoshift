import dayjs from "dayjs";

/**
 * Formats a Date using dayjs format tokens.
 * See https://day.js.org/docs/en/display/format for the full list.
 * Wrap literal text in brackets to avoid token interpretation: "YYYY-[build]-SSS".
 */
export function formatDate(date: Date, pattern: string): string {
  return dayjs(date).format(pattern);
}
