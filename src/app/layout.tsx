import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "@/app/globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Combination Party | מחולל תמורות",
  description: "מחולל תמורות לספרות עם אפשרויות ספירה, מיון וחיפוש.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.className}>{children}</body>
    </html>
  );
}
