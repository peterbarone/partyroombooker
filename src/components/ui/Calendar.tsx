"use client";
import { useMemo, useState } from "react";

type CalendarProps = {
  value?: string | null; // ISO yyyy-mm-dd
  onChange: (isoDate: string) => void;
  minDate?: Date; // default: today
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean; // return true to disable
  className?: string;
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const fmtIso = (d: Date) => d.toISOString().slice(0, 10);

export default function Calendar({ value, onChange, minDate, maxDate, disabledDates, className }: CalendarProps) {
  const today = startOfDay(new Date());
  const min = startOfDay(minDate || today);
  const max = maxDate ? startOfDay(maxDate) : undefined;

  const initial = (() => {
    if (value) return new Date(value + "T00:00:00");
    return today;
  })();

  const [cursor, setCursor] = useState<Date>(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const weeks = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const firstWeekday = first.getDay(); // 0 Sun
    const start = new Date(first);
    start.setDate(first.getDate() - firstWeekday);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    const out: Date[][] = [];
    for (let i = 0; i < 6; i++) {
      out.push(days.slice(i * 7, (i + 1) * 7));
    }
    return out;
  }, [cursor]);

  const isSameDay = (a?: Date | null, b?: Date | null) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const selected = value ? new Date(value + "T00:00:00") : null;

  const canNavPrev = useMemo(() => {
    if (!min) return true;
    const prevMonth = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    return prevMonth >= new Date(min.getFullYear(), min.getMonth(), 1);
  }, [cursor, min]);

  const canNavNext = useMemo(() => {
    if (!max) return true;
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    return nextMonth <= new Date(max.getFullYear(), max.getMonth(), 1);
  }, [cursor, max]);

  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={"rounded-3xl border-4 border-amber-700 bg-amber-50/90 shadow overflow-hidden " + (className || "")}>      
      <div className="flex items-center justify-between px-4 py-3 bg-amber-100 border-b-4 border-amber-700">
        <button
          onClick={() => canNavPrev && setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          disabled={!canNavPrev}
          className="px-3 py-2 rounded-xl bg-white border-2 border-amber-700 text-amber-800 disabled:opacity-40"
        >
          ←
        </button>
        <div className="app-headline text-[28px] sm:text-[30px] leading-none">{monthLabel}</div>
        <button
          onClick={() => canNavNext && setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          disabled={!canNavNext}
          className="px-3 py-2 rounded-xl bg-white border-2 border-amber-700 text-amber-800 disabled:opacity-40"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 pt-3">
        {weekdayShort.map((w) => (
          <div key={w} className="text-center text-amber-800 font-semibold text-sm">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-3">
        {weeks.flat().map((d, idx) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const beforeMin = d < min;
          const afterMax = max ? d > max : false;
          const disabled = beforeMin || afterMax || (disabledDates ? disabledDates(d) : false);
          const isSelected = isSameDay(selected, d);
          const isToday = isSameDay(today, d);

          const base = "aspect-square rounded-xl flex items-center justify-center select-none text-base sm:text-lg ";
          const tone = !inMonth
            ? "opacity-30"
            : disabled
              ? "opacity-50"
              : "hover:scale-[1.03] transition-transform";

          const state = isSelected
            ? "bg-white border-4 border-amber-400 shadow font-bold text-amber-900"
            : isToday
              ? "bg-white/80 border-2 border-amber-300 text-amber-900"
              : "bg-white/70 border-2 border-transparent text-amber-800";

          return (
            <button
              key={idx}
              onClick={() => !disabled && onChange(fmtIso(d))}
              disabled={disabled}
              className={`${base} ${tone} ${state}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
