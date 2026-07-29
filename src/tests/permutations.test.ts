import { describe, expect, it } from "vitest";
import {
  calculatePermutationCount,
  countDistinctPermutations,
  countPartialPermutations,
  countUniquePartialPermutations,
  factorial,
  generateUniquePermutations,
  iterateUniquePermutations,
} from "@/lib/permutations";

describe("permutation domain", () => {
  it("calculates factorial with BigInt", () => {
    expect(factorial(0)).toBe(1n);
    expect(factorial(10)).toBe(3_628_800n);
    expect(() => factorial(-1)).toThrow(RangeError);
  });

  it.each([
    ["1234", 24n],
    ["1123", 12n],
    ["1122", 6n],
    ["1112", 4n],
    ["1111", 1n],
  ])("counts distinct permutations for %s", (input, expected) => {
    expect(countDistinctPermutations(input)).toBe(expected);
    expect(BigInt(generateUniquePermutations(input).length)).toBe(expected);
  });

  it("counts positional and unique partial permutations", () => {
    expect(countPartialPermutations(4, 2)).toBe(12n);
    expect(countUniquePartialPermutations("1123", 2)).toBe(7n);
    expect(generateUniquePermutations("1123", 2)).toHaveLength(7);
    expect(calculatePermutationCount({ input: "1123", targetLength: 4, uniqueOnly: true })).toBe(12n);
    expect(calculatePermutationCount({ input: "1123", targetLength: 4, uniqueOnly: false })).toBe(24n);
  });

  it("creates no duplicate values", () => {
    const results = generateUniquePermutations("1122");
    expect(new Set(results).size).toBe(results.length);
  });

  it("preserves leading zeroes", () => {
    const results = generateUniquePermutations("0123");
    expect(results).toContain("0123");
    expect(results).toContain("3210");
    expect(results).toHaveLength(24);
  });

  it("iterates descending display order without losing leading zeroes", () => {
    expect([...iterateUniquePermutations("123", 3, "descending")][0]).toBe("321");
    const results = [...iterateUniquePermutations("0123", 4, "descending")];
    expect(results[0]).toBe("3210");
    expect(results.at(-1)).toBe("0123");
  });

  it("matches generator and array results", () => {
    expect([...iterateUniquePermutations("1123", 3)]).toEqual(generateUniquePermutations("1123", 3));
  });

  it("cleans backtracking state after early generator return", () => {
    const iterator = iterateUniquePermutations("1123");
    expect(iterator.next().value).toBe("1123");
    iterator.return(undefined);
    expect(generateUniquePermutations("1123")).toHaveLength(12);
    expect(generateUniquePermutations("1123")[0]).toBe("1123");
  });

  it("supports zero-length targets", () => {
    expect(generateUniquePermutations("123", 0)).toEqual([""]);
    expect(countUniquePartialPermutations("123", 0)).toBe(1n);
  });

  it("rejects invalid targets and input", () => {
    expect(() => generateUniquePermutations("123", -1)).toThrow(RangeError);
    expect(() => generateUniquePermutations("123", 4)).toThrow(RangeError);
    expect(() => generateUniquePermutations("", 0)).toThrow(RangeError);
    expect(() => generateUniquePermutations("12a", 2)).toThrow(TypeError);
  });
});
