import pinFrequency from "@/data/pin-frequency.json";
import { compareLexicographically } from "@/lib/display-order";

const frequencyByPin = pinFrequency as Record<string, number>;

export function getPinFrequency(pin: string): number {
  return frequencyByPin[pin] ?? 0;
}

export function sortByFrequencyDescending(values: readonly string[]): string[] {
  return [...values].sort((left, right) => {
    const frequencyDelta = getPinFrequency(right) - getPinFrequency(left);
    if (frequencyDelta !== 0) {
      return frequencyDelta;
    }
    return compareLexicographically(left, right, "descending");
  });
}
