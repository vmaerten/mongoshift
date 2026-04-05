const pad = (n: number, size: number): string => String(n).padStart(size, "0");

/**
 * Formats a Date using a small set of tokens.
 * Tokens: YYYY, MM, DD, HH, mm, ss, SSS
 * Longest tokens are matched first.
 */
export function formatDate(date: Date, pattern: string): string {
  const tokens: Record<string, string> = {
    YYYY: pad(date.getFullYear(), 4),
    MM: pad(date.getMonth() + 1, 2),
    DD: pad(date.getDate(), 2),
    HH: pad(date.getHours(), 2),
    mm: pad(date.getMinutes(), 2),
    ss: pad(date.getSeconds(), 2),
    SSS: pad(date.getMilliseconds(), 3),
  };
  // Sort keys by length desc to avoid partial overlaps.
  const keys = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const re = new RegExp(keys.join("|"), "g");
  return pattern.replace(re, (match) => tokens[match] ?? match);
}
