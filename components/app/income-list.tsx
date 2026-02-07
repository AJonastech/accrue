"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type IncomeEntry = {
  id: string;
  date: string;
  dateLabel: string;
  amount: number;
  amountLabel: string;
  saved: number;
  savedLabel: string;
};

type IncomeListProps = {
  entries: IncomeEntry[];
};

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    date,
  );

export function IncomeList({ entries }: IncomeListProps) {
  const [query, setQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const months = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((entry) => {
      const date = new Date(entry.date);
      const key = getMonthKey(date);
      if (!map.has(key)) {
        map.set(key, getMonthLabel(date));
      }
    });

    return [
      { key: "all", label: "All" },
      ...Array.from(map.entries()).map(([key, label]) => ({
        key,
        label,
      })),
    ];
  }, [entries]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const date = new Date(entry.date);
      const monthKey = getMonthKey(date);
      if (selectedMonth !== "all" && selectedMonth !== monthKey) {
        return false;
      }

      if (!normalized) return true;

      return [
        entry.dateLabel,
        entry.amountLabel,
        entry.savedLabel,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [entries, query, selectedMonth]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search income by date or amount"
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {months.map((month) => (
            <button
              key={month.key}
              type="button"
              onClick={() => setSelectedMonth(month.key)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                selectedMonth === month.key
                  ? "border-primary/40 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No income entries match your search or filter.
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          <div className="hidden grid-cols-[1.6fr_1fr_1fr_auto] gap-4 pb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:grid">
            <span>Date</span>
            <span className="text-right">Income</span>
            <span className="text-right">Saved</span>
            <span className="text-right">Edit</span>
          </div>
          {filtered.map((entry) => (
            <div key={entry.id} className="py-4">
              <div className="flex items-center justify-between gap-4 md:hidden">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{entry.dateLabel}</p>
                  <p className="text-xs text-muted-foreground">Income entry</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{entry.amountLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      Saved{" "}
                      <span className="font-medium text-foreground">
                        {entry.savedLabel}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-primary/30 text-primary hover:bg-primary/10"
                    asChild
                  >
                    <Link href={`/income/${entry.id}/edit`} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="hidden md:grid md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center md:gap-4">
                <div>
                  <p className="text-sm font-semibold">{entry.dateLabel}</p>
                  <p className="text-xs text-muted-foreground">Income entry</p>
                </div>
                <div className="text-sm font-semibold text-right">
                  {entry.amountLabel}
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  {entry.savedLabel}
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                    asChild
                  >
                    <Link href={`/income/${entry.id}/edit`}>
                      <Pencil className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Edit</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
