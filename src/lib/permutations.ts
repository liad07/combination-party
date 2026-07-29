import { InputValidation } from "@/lib/validation";
import { compareLexicographically } from "@/lib/display-order";
import type { PermutationOptions } from "@/types/domain";

export function factorial(value: number): bigint {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError("Factorial requires a non-negative integer");
  }
  let result = 1n;
  for (let current = 2n; current <= BigInt(value); current += 1n) {
    result *= current;
  }
  return result;
}

function frequencies(input: string): Map<string, number> {
  const result = new Map<string, number>();
  for (const digit of input) {
    result.set(digit, (result.get(digit) ?? 0) + 1);
  }
  return result;
}

export function countDistinctPermutations(input: string): bigint {
  InputValidation.digits(input);
  let divisor = 1n;
  for (const count of frequencies(input).values()) {
    divisor *= factorial(count);
  }
  return factorial(input.length) / divisor;
}

export function countPartialPermutations(inputLength: number, targetLength: number): bigint {
  if (!Number.isInteger(inputLength) || inputLength < 0) {
    throw new RangeError("Input length must be a non-negative integer");
  }
  InputValidation.targetLength(targetLength, inputLength);
  return factorial(inputLength) / factorial(inputLength - targetLength);
}

export function countUniquePartialPermutations(input: string, targetLength: number): bigint {
  InputValidation.digits(input);
  InputValidation.targetLength(targetLength, input.length);
  const counts = [...frequencies(input).values()];
  let total = 0n;

  const visit = (index: number, remaining: number, divisor: bigint): void => {
    if (index === counts.length) {
      if (remaining === 0) {
        total += factorial(targetLength) / divisor;
      }
      return;
    }
    const maximum = Math.min(counts[index], remaining);
    for (let used = 0; used <= maximum; used += 1) {
      visit(index + 1, remaining - used, divisor * factorial(used));
    }
  };

  visit(0, targetLength, 1n);
  return total;
}

export function calculatePermutationCount(options: PermutationOptions): bigint {
  InputValidation.digits(options.input);
  return options.uniqueOnly
    ? countUniquePartialPermutations(options.input, options.targetLength)
    : countPartialPermutations(options.input.length, options.targetLength);
}

export function* iterateUniquePermutations(
  input: string,
  targetLength = input.length,
  order: "ascending" | "descending" = "ascending",
): Generator<string> {
  InputValidation.digits(input);
  InputValidation.targetLength(targetLength, input.length);
  const digitCounts = frequencies(input);
  const digits = [...digitCounts.keys()].sort((left, right) =>
    compareLexicographically(left, right, order));
  const path: string[] = [];

  function* walk(): Generator<string> {
    if (path.length === targetLength) {
      yield path.join("");
      return;
    }
    for (const digit of digits) {
      const remaining = digitCounts.get(digit) ?? 0;
      if (remaining === 0) {
        continue;
      }
      digitCounts.set(digit, remaining - 1);
      path.push(digit);
      try {
        yield* walk();
      } finally {
        path.pop();
        digitCounts.set(digit, remaining);
      }
    }
  }

  yield* walk();
}

export function generateUniquePermutations(input: string, targetLength = input.length): string[] {
  return [...iterateUniquePermutations(input, targetLength)];
}

export function* iteratePositionalPermutations(
  input: string,
  targetLength = input.length,
  order: "ascending" | "descending" = "ascending",
): Generator<string> {
  InputValidation.digits(input);
  InputValidation.targetLength(targetLength, input.length);
  const used = new Array<boolean>(input.length).fill(false);
  const path: string[] = [];
  const indices = [...input].map((_, index) => index).sort((left, right) => {
    const digitOrder = compareLexicographically(input[left], input[right], order);
    return digitOrder === 0 ? left - right : digitOrder;
  });

  function* walk(): Generator<string> {
    if (path.length === targetLength) {
      yield path.join("");
      return;
    }
    for (const index of indices) {
      if (used[index]) {
        continue;
      }
      used[index] = true;
      path.push(input[index]);
      try {
        yield* walk();
      } finally {
        path.pop();
        used[index] = false;
      }
    }
  }

  yield* walk();
}
