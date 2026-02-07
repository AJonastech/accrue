"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { IncomeEntry } from "@/lib/income";
import { cn } from "@/lib/utils";

type IncomeListProps = {
  entries: IncomeEntry[];
  onDeleteEntry?: (id: string) => void;
};

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    date,
  );

export function IncomeList({ entries, onDeleteEntry }: IncomeListProps) {
  const [items, setItems] = useState(entries);
  const [query, setQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setItems(entries);
  }, [entries]);

  useEffect(() => {
    if (!activeId) return;
    if (!items.some((entry) => entry.id === activeId)) {
      setActiveId(null);
    }
  }, [activeId, items]);

  const months = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((entry) => {
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
  }, [items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((entry) => {
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
  }, [items, query, selectedMonth]);

  const grouped = useMemo(() => {
    const groups = new Map<
      string,
      { label: string; entries: IncomeEntry[] }
    >();

    filtered.forEach((entry) => {
      const date = new Date(entry.date);
      const key = getMonthKey(date);
      if (!groups.has(key)) {
        groups.set(key, { label: getMonthLabel(date), entries: [] });
      }
      groups.get(key)?.entries.push(entry);
    });

    return Array.from(groups.entries()).map(([key, group]) => ({
      key,
      label: group.label,
      entries: group.entries,
    }));
  }, [filtered]);

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setDeletingId(id);
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const message = await response.text();
        setDeleteError(message || "Unable to delete income entry.");
        return;
      }
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      onDeleteEntry?.(id);
    } catch (error) {
      setDeleteError("Unable to delete income entry.");
    } finally {
      setDeletingId((current) => (current === id ? null : current));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search income by date or amount"
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
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
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} entries</span>
            <span>Newest first</span>
          </div>
          {grouped.map((group) => (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>{group.label}</span>
                <span>{group.entries.length}</span>
              </div>
              <div className="divide-y divide-border/60">
                <div className="hidden grid-cols-[1.6fr_1fr_1fr_auto] gap-4 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:grid">
                  <span>Date</span>
                  <span className="text-right">Income</span>
                  <span className="text-right">Saved</span>
                  <span className="text-right">Edit</span>
                </div>
                {group.entries.map((entry) => (
                  <div key={entry.id} className="py-2.5">
                    <MobileIncomeRow
                      entry={entry}
                      onDelete={handleDelete}
                      isDeleting={deletingId === entry.id}
                      activeId={activeId}
                      onActivate={setActiveId}
                    />

                    <div className="hidden md:grid md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-center md:gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          {entry.dateLabel}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Income entry
                        </p>
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
            </div>
          ))}
        </div>
      )}
      {deleteError ? (
        <p className="text-sm text-destructive">{deleteError}</p>
      ) : null}
    </div>
  );
}

type MobileIncomeRowProps = {
  entry: IncomeEntry;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  activeId?: string | null;
  onActivate?: (id: string | null) => void;
};

function MobileIncomeRow({
  entry,
  onDelete,
  isDeleting = false,
  activeId,
  onActivate,
}: MobileIncomeRowProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  useEffect(() => {
    if (!activeId || activeId === entry.id || isDragging) return;
    setOffset(0);
  }, [activeId, entry.id, isDragging]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isDeleting) return;
    onActivate?.(entry.id);
    setIsDragging(true);
    startX.current = event.clientX;
    startOffset.current = offset;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = event.clientX - startX.current;
    const nextOffset = Math.min(0, Math.max(-96, startOffset.current + delta));
    setOffset(nextOffset);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    const shouldOpen = offset < -56;
    if (shouldOpen) {
      setOffset(-96);
      onActivate?.(entry.id);
    } else {
      setOffset(0);
      if (activeId === entry.id) {
        onActivate?.(null);
      }
    }
  };

  const isReveal = offset < -8 || isDragging;

  return (
    <div className="md:hidden">
      <div className="relative overflow-hidden bg-background">
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end bg-destructive/10 px-3 opacity-0 transition-opacity duration-200",
            isReveal ? "opacity-100" : "opacity-0",
          )}
        >
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            disabled={isDeleting}
            className="pointer-events-auto flex items-center gap-2 text-xs font-semibold text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
        <div
          className={cn(
            "relative flex touch-pan-y items-center justify-between gap-3 bg-background px-4 py-3 transition-transform ease-out will-change-transform",
            isDragging ? "duration-0" : "duration-200",
          )}
          style={{ transform: `translateX(${offset}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <DateBadge date={entry.date} />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5">
                {entry.amountLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                Saved {entry.savedLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-xs text-muted-foreground">
                {entry.dateLabel}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-primary/30 text-primary hover:bg-primary/10"
              asChild
            >
              <Link href={`/income/${entry.id}/edit`} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateBadge({ date }: { date: string }) {
  const parsed = new Date(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    parsed,
  );
  const day = parsed.getDate();

  return (
    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/20">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {month}
      </span>
      <span className="text-base font-semibold leading-5 text-foreground">
        {day}
      </span>
    </div>
  );
}
