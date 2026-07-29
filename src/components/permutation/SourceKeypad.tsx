type SourceKeypadProps = {
  highlightedDigits: readonly string[];
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  empty: boolean;
  maximumReached: boolean;
};

const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function SourceKeypad({
  highlightedDigits,
  onDigitPress,
  onBackspace,
  onClear,
  empty,
  maximumReached,
}: SourceKeypadProps) {
  return (
    <fieldset>
      <legend className="mb-3 font-bold">הזנת ספרות מקור</legend>
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-3" dir="ltr">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigitPress(digit)}
            disabled={maximumReached}
            className={`${digit === "0" ? "col-start-2" : ""} aspect-square rounded-2xl border text-xl font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
              highlightedDigits.includes(digit)
                ? "border-cyan bg-cyan/20 text-white shadow-[0_0_22px_rgba(45,212,191,.25)]"
                : "border-white/10 bg-black/20 text-slate-300 hover:border-white/30"
            }`}
          >
            {digit}
          </button>
        ))}
      </div>
      <div className="mx-auto mt-3 flex max-w-xs gap-3">
        <button
          className="secondary-button flex-1"
          type="button"
          onClick={onBackspace}
          disabled={empty}
          aria-label="מחיקת הספרה האחרונה"
        >
          מחיקה
        </button>
        <button
          className="secondary-button flex-1"
          type="button"
          onClick={onClear}
          disabled={empty}
          aria-label="ניקוי כל הספרות"
        >
          ניקוי הכול
        </button>
      </div>
    </fieldset>
  );
}
