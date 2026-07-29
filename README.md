# Combination Party

מחולל תמורות ספרות מודרני בעברית, עם ממשק RTL, שמירת אפסים מובילים, טיפול בכפילויות ודירוג תוצאות לפי שכיחות.

[פתיחת האפליקציה](https://combiparty.vercel.app)

## יכולות מרכזיות

- הזנת רצף של 1–10 ספרות באמצעות לוח מקשים נגיש.
- שמירת סדר ההזנה, ספרות כפולות ואפסים מובילים.
- בחירת אורך התוצאה ומצב תוצאות ייחודיות.
- ספירה מדויקת באמצעות `BigInt` לפני יצירת התוצאות.
- Backtracking כללי ומפת שכיחויות שמונעת יצירת כפילויות.
- Generator עצל, יצירה באצוות ואפשרות לבטל חישוב.
- אישור לפני חישובים גדולים ומצב ספירה בלבד מעל הסף הבטוח.
- מיון לפי שכיחות, סדר יורד, ערבוב וחיפוש.
- תצוגה מדורגת עם עד 100 תוצאות בעמוד ומגבלה של 5,000 תוצאות בזיכרון.
- ממשק כהה, רספונסיבי ונגיש למקלדת.

## טכנולוגיות

- Next.js 16 ו־React 19
- TypeScript במצב `strict`
- Tailwind CSS
- Vitest ו־Testing Library
- Vercel

## התקנה מקומית

נדרש Node.js 20 ומעלה.

```bash
git clone https://github.com/liad07/combination-party.git
cd combination-party
npm ci
npm run dev
```

האפליקציה זמינה כברירת מחדל בכתובת `http://localhost:3000`.

## פקודות

```bash
npm run dev       # שרת פיתוח
npm run build     # בניית Production סטטית
npm run preview   # תצוגה מקומית של תיקיית out
npm run lint      # בדיקות ESLint
npm test          # בדיקות Vitest
```

## לוגיקת התמורות

הקלט נשמר תמיד כמחרוזת, ולכן ערך כגון `0123` אינו מאבד את האפס המוביל.

לתמורות של `n` איברים שונים באורך `k`:

```text
P(n, k) = n! / (n - k)!
```

כאשר קיימות ספרות כפולות, המחולל משתמש במפת שכיחויות במהלך ה־Backtracking. בכל צעד נבחרת רק ספרה שנותרה זמינה, הכמות שלה מופחתת ומוחזרת לאחר החזרה מהרקורסיה. כך כפילויות אינן נוצרות מלכתחילה.

דוגמאות:

- `1234` → 24 תמורות ייחודיות
- `1123` → 12
- `1122` → 6
- `1112` → 4
- `1111` → 1

## מבנה הפרויקט

```text
src/
├── app/                         # App Router, metadata ועיצוב גלובלי
├── components/
│   ├── layout/                  # מעטפת האפליקציה
│   └── permutation/             # לוח המקשים וממשק המחולל
├── data/                        # נתוני שכיחות לקודים בני ארבע ספרות
├── hooks/                       # יצירה באצוות, ביטול וניהול מצב
├── lib/                         # אלגוריתמים, ספירה, מיון ואימות
├── tests/                       # בדיקות יחידה ואינטגרציה
└── types/                       # טיפוסי Domain
```

## בדיקות ובטיחות ביצועים

מערך הבדיקות מכסה את אלגוריתם התמורות, Generator, ספירות `BigInt`, כפילויות, אפסים מובילים, מיון לפי שכיחות וזרימת המשתמש.

- מעל 10,000 תוצאות נדרש אישור מפורש.
- מעל 100,000 תוצאות החישוב עובר לספירה בלבד.
- לכל היותר 5,000 תוצאות נשמרות לתצוגה.
- ביטול חישוב מסמן בבירור שהתוצאות חלקיות.

```bash
npm run lint
npm test
npm run build
```

## פריסה ב־Vercel

הפרויקט מקושר ל־Vercel בשם `combiparty`. כל push ל־`main` יכול לשמש כבסיס לפריסת Production.

פריסה ידנית:

```bash
vercel deploy --prod
```

## English

Combination Party is a Hebrew-first, RTL permutation generator built with Next.js and TypeScript. It preserves leading zeroes, handles repeated digits without generating duplicates, ranks four-digit results by frequency, and safely limits large computations.
