"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6" dir="rtl">
      <div className="glass-card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-black">אירעה שגיאה בלתי צפויה</h1>
        <p className="mt-3 text-slate-400">אפשר לנסות לטעון מחדש את הממשק.</p>
        <button type="button" className="primary-button mt-6" onClick={reset}>ניסיון נוסף</button>
      </div>
    </main>
  );
}
