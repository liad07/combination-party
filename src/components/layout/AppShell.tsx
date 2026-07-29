import { Grid3X3 } from "lucide-react";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-ink/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-7">
          <span className="grid size-10 place-items-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan shadow-glow">
            <Grid3X3 size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-black tracking-tight text-white">Combination Party</p>
            <p className="text-xs font-semibold text-slate-400">מנוע צירופים</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-7 sm:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
