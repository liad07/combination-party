"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, Search, Shuffle, Square, Zap } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { SourceKeypad } from "@/components/permutation/SourceKeypad";
import { DISPLAY_LIMIT, usePermutationGenerator } from "@/hooks/usePermutationGenerator";
import { compareLexicographically, shuffled } from "@/lib/display-order";
import { getPinFrequency, sortByFrequencyDescending } from "@/lib/pin-frequency";
import { calculatePermutationCount } from "@/lib/permutations";
import type { PermutationOptions } from "@/types/domain";

const CONFIRMATION_THRESHOLD = 10_000n;
const COUNT_ONLY_THRESHOLD = 100_000n;
const MAX_INPUT_LENGTH = 10;
const PAGE_SIZE = 100;

export function PermutationPanel() {
  const [input, setInput] = useState("1234");
  const [targetLength, setTargetLength] = useState(4);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [countOnly, setCountOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [displayResults, setDisplayResults] = useState<string[]>([]);
  const [pending, setPending] = useState<PermutationOptions | null>(null);
  const [page, setPage] = useState(0);
  const confirmationButton = useRef<HTMLButtonElement>(null);
  const generator = usePermutationGenerator();
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (pending) {
      confirmationButton.current?.focus();
    }
  }, [pending]);

  const orderedResults = useMemo(
    () => (displayResults.length > 0 ? displayResults : sortByFrequencyDescending(generator.results)),
    [displayResults, generator.results],
  );
  const visibleResults = useMemo(
    () => orderedResults.filter((result) => result.includes(deferredSearch)),
    [deferredSearch, orderedResults],
  );
  const pageCount = Math.max(1, Math.ceil(visibleResults.length / PAGE_SIZE));
  const pagedResults = visibleResults.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const clearOutput = (): void => {
    setPending(null);
    setDisplayResults([]);
    setSearch("");
    setPage(0);
    generator.reset();
  };

  const mutateInput = (nextInput: string): void => {
    clearOutput();
    setTargetLength((length) => length === input.length ? nextInput.length : Math.min(length, nextInput.length));
    setInput(nextInput);
  };

  const appendDigit = (digit: string): void => {
    if (input.length < MAX_INPUT_LENGTH) {
      mutateInput(`${input}${digit}`);
    }
  };

  const execute = (options: PermutationOptions, force = false): void => {
    try {
      const count = calculatePermutationCount(options);
      if (!force && count > CONFIRMATION_THRESHOLD) {
        setPending(options);
        return;
      }
      setPending(null);
      setDisplayResults([]);
      setPage(0);
      void generator.run(options, countOnly || count > COUNT_ONLY_THRESHOLD);
    } catch {
      void generator.run(options, countOnly);
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    execute({ input, targetLength, uniqueOnly });
  };

  return (
    <section aria-labelledby="permutation-title">
      <header className="mb-7 flex items-start justify-between gap-5 px-1 sm:mb-9">
        <div>
          <p className="mb-2 text-sm font-black tracking-wide text-cyan">מנוע צירופים</p>
          <h1 id="permutation-title" className="text-3xl font-black tracking-tight text-white sm:text-5xl">מחולל תמורות מבוקר</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">החישוב מתבצע מקומית, שומר אפסים מובילים ומונע כפילויות ישירות בעת היצירה.</p>
        </div>
        <span className="hidden rounded-2xl border border-violet/25 bg-violet/10 p-4 text-violet shadow-[0_0_30px_rgba(155,123,255,.15)] sm:block">
          <Zap aria-hidden="true" />
        </span>
      </header>

      <form onSubmit={submit}>
        <div className="glass-card interaction-card overflow-hidden" data-testid="source-interaction-card">
          <div className="border-b border-white/10 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="step-badge">1</span>
              <div>
                <h2 className="font-black text-white">בניית הרצף והפעלה</h2>
                <p className="text-sm text-slate-400">בחרו ספרות, התאימו אפשרויות והפעילו</p>
              </div>
            </div>
          </div>

          <div className="interaction-grid p-5 sm:p-7">
            <div className="interaction-source min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span id="source-sequence-label" className="font-bold text-slate-200">ספרות מקור</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${input.length === MAX_INPUT_LENGTH ? "border-violet/30 bg-violet/10 text-violet" : "border-cyan/25 bg-cyan/10 text-cyan"}`}>
                  {input.length === MAX_INPUT_LENGTH ? "הגעתם למקסימום" : `${MAX_INPUT_LENGTH - input.length} מקומות פנויים`}
                </span>
              </div>
              <output
                className="sequence-display"
                dir="ltr"
                aria-labelledby="source-sequence-label"
              >
                {input || "—"}
              </output>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-400">
                <span>כפילויות ואפסים מובילים נתמכים</span>
                <span className="font-mono font-bold text-slate-300" aria-hidden="true">{input.length} / {MAX_INPUT_LENGTH}</span>
                <span className="sr-only" aria-live="polite">
                  הרצף הנוכחי הוא {input || "ריק"}, אורך {input.length} מתוך {MAX_INPUT_LENGTH}
                </span>
              </div>
            </div>

            <div className="interaction-keypad rounded-2xl border border-white/10 bg-black/15 p-4">
              <SourceKeypad
                highlightedDigits={[...input]}
                onDigitPress={appendDigit}
                onBackspace={() => mutateInput(input.slice(0, -1))}
                onClear={() => mutateInput("")}
                empty={input.length === 0}
                maximumReached={input.length >= MAX_INPUT_LENGTH}
              />
            </div>

            <div className="compact-options" data-testid="compact-options">
              <div className="target-length-control">
                <div>
                  <label className="font-bold text-slate-100" htmlFor="target-length">אורך תוצאה</label>
                  <span className="mt-1 block text-xs text-slate-400">בין 0 לאורך המקור</span>
                </div>
                <input
                  id="target-length"
                  className="field h-11 w-20 px-3 text-center"
                  type="number"
                  min={0}
                  max={input.length}
                  value={targetLength}
                  onChange={(event) => {
                    clearOutput();
                    setTargetLength(Number(event.target.value));
                  }}
                />
              </div>
              <label className="compact-toggle">
                <input className="size-5 shrink-0 accent-cyan" type="checkbox" checked={uniqueOnly} onChange={(event) => {
                  clearOutput();
                  setUniqueOnly(event.target.checked);
                }} />
                <span><strong className="text-sm text-slate-100">תוצאות ייחודיות בלבד</strong><small className="mt-0.5 block text-xs leading-5 text-slate-400">ללא כפילויות מספרות זהות</small></span>
              </label>
              <label className="compact-toggle">
                <input className="size-5 shrink-0 accent-violet" type="checkbox" checked={countOnly} onChange={(event) => {
                  clearOutput();
                  setCountOnly(event.target.checked);
                }} />
                <span><strong className="text-sm text-slate-100">ספירה בלבד</strong><small className="mt-0.5 block text-xs leading-5 text-slate-400">ללא יצירת רשימת תוצאות</small></span>
              </label>
            </div>

            <div className="interaction-actions">
              <button className="primary-button flex min-h-12 flex-1 items-center justify-center gap-2 text-base" type="submit" disabled={generator.running}>
                <Zap size={18} aria-hidden="true" />
                חישוב והפעלה
              </button>
              {generator.running && (
                <button className="secondary-button flex min-h-12 items-center justify-center gap-2" type="button" onClick={generator.cancel}>
                  <Square size={16} aria-hidden="true" /> ביטול
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {pending && (
        <div role="alert" className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <strong className="text-white">נדרש אישור מפורש</strong>
              <p className="mt-1 text-sm leading-6 text-slate-300">המרחב מכיל {calculatePermutationCount(pending).toLocaleString("he-IL")} תוצאות. מעל 100,000 ברירת המחדל היא ספירה בלבד.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button ref={confirmationButton} className="primary-button" type="button" onClick={() => execute(pending, true)}>אישור והמשך</button>
                <button className="secondary-button" type="button" onClick={() => setPending(null)}>חזרה לעריכה</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {generator.error && <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">{generator.error}</p>}
      {generator.cancelled && <p role="status" className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-amber-200">החישוב הופסק. התוצאות המוצגות חלקיות.</p>}

      {generator.count !== null && (
        <section className="glass-card mt-5 overflow-hidden" aria-labelledby="results-title">
          <div className="border-b border-white/10 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="step-badge border-success/30 bg-success/10 text-success">2</span>
              <div>
                <h2 id="results-title" className="font-black text-white">תוצאות</h2>
                <p className="text-sm text-slate-400">סיכום, מיון ודפדוף</p>
              </div>
            </div>
          </div>

          <div className="grid gap-px border-b border-white/10 bg-white/10 sm:grid-cols-3" aria-live="polite">
            <div className="stat-card"><span>סה״כ תמורות</span><strong className="text-cyan">{generator.count.toLocaleString("he-IL")}</strong></div>
            <div className="stat-card"><span>נוצרו לתצוגה</span><strong>{generator.results.length.toLocaleString("he-IL")}</strong></div>
            <div className="stat-card"><span>מגבלת תצוגה</span><strong className="text-violet">{DISPLAY_LIMIT.toLocaleString("he-IL")}</strong></div>
          </div>

          {generator.results.length > 0 && (
            <div className="p-5 sm:p-7">
              <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_auto_auto_auto]">
                <label className="relative">
                  <span className="sr-only">חיפוש בתוצאות המוצגות</span>
                  <Search className="pointer-events-none absolute right-3 top-3.5 text-slate-500" size={18} aria-hidden="true" />
                  <input className="field pr-10" value={search} onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }} placeholder="חיפוש בתוצאות המוצגות" />
                </label>
                <button className="secondary-button" type="button" onClick={() => {
                  setDisplayResults(sortByFrequencyDescending(generator.results));
                  setPage(0);
                }}>לפי שכיחות</button>
                <button className="secondary-button" type="button" onClick={() => {
                  setDisplayResults([...generator.results].sort((left, right) =>
                    compareLexicographically(left, right, "descending")));
                  setPage(0);
                }}>סדר יורד</button>
                <button className="secondary-button flex items-center justify-center gap-2" type="button" onClick={() => {
                  setDisplayResults(shuffled(generator.results));
                  setPage(0);
                }}><Shuffle size={17} aria-hidden="true" /> ערבוב תצוגה</button>
              </div>

              {generator.truncated && <p className="mb-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">הרשימה הוגבלה לתוצאות הראשונות לצורך ביצועים.</p>}
              <p className="mb-4 rounded-xl border border-cyan/15 bg-cyan/5 p-3 text-sm text-slate-400">ברירת המחדל מדרגת תוצאות בנות 4 ספרות לפי שכיחות במאגר הנתונים.</p>

              <ol className="grid max-h-[36rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                {pagedResults.map((result, index) => {
                  const frequency = getPinFrequency(result);
                  return (
                    <li key={`${result}-${page * PAGE_SIZE + index}`} className="result-card">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-bold text-slate-400">#{page * PAGE_SIZE + index + 1}</span>
                        <code dir="ltr" className="truncate text-lg font-black tracking-[0.18em] text-success">{result || "∅"}</code>
                      </div>
                      <span className="shrink-0 rounded-lg bg-black/20 px-2 py-1 text-xs text-slate-400">{frequency > 0 ? `שכיחות ${frequency}` : "אין נתון"}</span>
                    </li>
                  );
                })}
              </ol>

              <nav className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-5" aria-label="דפדוף בתוצאות">
                <button className="secondary-button flex items-center gap-1" type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                  <ChevronRight size={18} aria-hidden="true" /> הקודם
                </button>
                <span className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-sm font-semibold text-slate-300" aria-live="polite">עמוד {page + 1} מתוך {pageCount}</span>
                <button className="secondary-button flex items-center gap-1" type="button" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>
                  הבא <ChevronLeft size={18} aria-hidden="true" />
                </button>
              </nav>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
