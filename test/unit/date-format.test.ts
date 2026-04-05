import { describe, it, expect } from "vitest";
import { formatDate } from "../../src/utils/date-format.js";

describe("formatDate", () => {
  const d = new Date(2026, 3, 5, 9, 7, 3, 42); // 2026-04-05 09:07:03.042

  it("formats with default migrate-mongo style YYYYMMDDHHmmss", () => {
    expect(formatDate(d, "YYYYMMDDHHmmss")).toBe("20260405090703");
  });

  it("supports separators", () => {
    expect(formatDate(d, "YYYY-MM-DD_HH:mm:ss")).toBe("2026-04-05_09:07:03");
  });

  it("supports milliseconds", () => {
    expect(formatDate(d, "YYYYMMDD-HHmmss-SSS")).toBe("20260405-090703-042");
  });

  it("pads single-digit month, day, hour, minute, second", () => {
    const d2 = new Date(2024, 0, 2, 3, 4, 5, 6);
    expect(formatDate(d2, "YYYYMMDDHHmmssSSS")).toBe("20240102030405006");
  });

  it("supports bracket escaping for literals", () => {
    expect(formatDate(d, "YYYY-[build]-SSS")).toBe("2026-build-042");
  });

});
