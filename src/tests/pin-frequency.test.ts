import { describe, expect, it } from "vitest";
import { getPinFrequency, sortByFrequencyDescending } from "@/lib/pin-frequency";
import { generateUniquePermutations } from "@/lib/permutations";

describe("pin frequency ranking", () => {
  it("loads public four-digit frequency counts", () => {
    expect(getPinFrequency("1234")).toBe(255);
    expect(getPinFrequency("2580")).toBe(180);
    expect(getPinFrequency("9999")).toBeGreaterThan(0);
  });

  it("orders 2580 permutations from most to least frequent", () => {
    const ranked = sortByFrequencyDescending(generateUniquePermutations("2580", 4));
    expect(ranked).toHaveLength(24);
    expect(ranked.slice(0, 5)).toEqual(["2580", "8520", "0258", "0825", "0852"]);
    expect(ranked.at(-1)).toBe("8052");
    expect(getPinFrequency(ranked[0])).toBeGreaterThanOrEqual(getPinFrequency(ranked[1]));
    expect(ranked.every((pin) => pin.length === 4)).toBe(true);
    expect(ranked.some((pin) => pin.startsWith("0"))).toBe(true);
  });
});
