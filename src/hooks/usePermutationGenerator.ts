"use client";

import { useCallback, useRef, useState } from "react";
import {
  calculatePermutationCount,
  iteratePositionalPermutations,
  iterateUniquePermutations,
} from "@/lib/permutations";
import type { PermutationOptions } from "@/types/domain";

export const DISPLAY_LIMIT = 5_000;
const BATCH_SIZE = 500;

interface GeneratorState {
  count: bigint | null;
  results: string[];
  running: boolean;
  cancelled: boolean;
  truncated: boolean;
  error: string | null;
}

const initialState: GeneratorState = {
  count: null,
  results: [],
  running: false,
  cancelled: false,
  truncated: false,
  error: null,
};

export function usePermutationGenerator() {
  const [state, setState] = useState<GeneratorState>(initialState);
  const runId = useRef(0);

  const cancel = useCallback(() => {
    runId.current += 1;
    setState((current) => ({
      ...current,
      running: false,
      cancelled: true,
      truncated: current.count !== null && current.count > BigInt(current.results.length),
    }));
  }, []);

  const reset = useCallback(() => {
    runId.current += 1;
    setState(initialState);
  }, []);

  const run = useCallback(async (options: PermutationOptions, countOnly = false) => {
    const currentRun = runId.current + 1;
    runId.current = currentRun;
    try {
      const count = calculatePermutationCount(options);
      setState({ count, results: [], running: !countOnly, cancelled: false, truncated: false, error: null });
      if (countOnly) {
        return;
      }
      const iterator = options.uniqueOnly
        ? iterateUniquePermutations(options.input, options.targetLength, "descending")
        : iteratePositionalPermutations(options.input, options.targetLength, "descending");
      const results: string[] = [];
      let done = false;
      while (!done && results.length < DISPLAY_LIMIT && runId.current === currentRun) {
        for (let index = 0; index < BATCH_SIZE && results.length < DISPLAY_LIMIT; index += 1) {
          const next = iterator.next();
          done = Boolean(next.done);
          if (next.done) {
            break;
          }
          results.push(next.value);
        }
        setState({
          count,
          results: [...results],
          running: !done,
          cancelled: false,
          truncated: !done && results.length >= DISPLAY_LIMIT,
          error: null,
        });
        if (!done && results.length < DISPLAY_LIMIT) {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
        }
      }
      if (runId.current === currentRun) {
        setState({
          count,
          results,
          running: false,
          cancelled: false,
          truncated: count > BigInt(results.length),
          error: null,
        });
      }
      iterator.return?.(undefined);
    } catch (error) {
      setState({
        ...initialState,
        error: error instanceof Error ? error.message : "שגיאה לא צפויה",
      });
    }
  }, []);

  return { ...state, run, cancel, reset };
}
