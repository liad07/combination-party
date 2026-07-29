import { describe, expect, it } from "vitest";
import { InputValidation } from "@/lib/validation";

describe("InputValidation", () => {
  it("accepts digit strings and preserves leading zeroes", () => {
    expect(InputValidation.digits("0012")).toBe("0012");
  });

  it.each(["", "12345678901"])("rejects invalid digit length: %s", (value) => {
    expect(() => InputValidation.digits(value)).toThrow(RangeError);
  });

  it.each(["12a", "12 3", "١٢٣"])("rejects non-ASCII digits: %s", (value) => {
    expect(() => InputValidation.digits(value)).toThrow(TypeError);
  });

  it("validates integer target bounds", () => {
    expect(InputValidation.targetLength(0, 4)).toBe(0);
    expect(InputValidation.targetLength(4, 4)).toBe(4);
    expect(() => InputValidation.targetLength(-1, 4)).toThrow(RangeError);
    expect(() => InputValidation.targetLength(5, 4)).toThrow(RangeError);
    expect(() => InputValidation.targetLength(1.5, 4)).toThrow(RangeError);
  });
});
