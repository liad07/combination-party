export function compareLexicographically(
  left: string,
  right: string,
  order: "ascending" | "descending" = "ascending",
): number {
  if (left === right) {
    return 0;
  }
  const ascending = left < right ? -1 : 1;
  return order === "ascending" ? ascending : -ascending;
}

export function shuffled<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
