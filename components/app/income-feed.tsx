"use client";

import { useEffect, useRef, useState } from "react";

import { IncomeList } from "@/components/app/income-list";
import type { IncomeEntry } from "@/lib/income";

type IncomeFeedProps = {
  initialEntries: IncomeEntry[];
  initialCursor: string | null;
};

export function IncomeFeed({ initialEntries, initialCursor }: IncomeFeedProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEntries(initialEntries);
    setCursor(initialCursor);
  }, [initialEntries, initialCursor]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [cursor, isLoading]);

  const loadMore = async () => {
    if (!cursor || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/income?cursor=${cursor}`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to load more income.");
      }
      const data = await response.json();
      if (!data?.entries || !Array.isArray(data.entries)) {
        throw new Error("Unable to load more income.");
      }
      setEntries((prev) => [...prev, ...data.entries]);
      setCursor(data.nextCursor ?? null);
    } catch (err) {
      setError("Unable to load more income.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <IncomeList
        entries={entries}
        onDeleteEntry={(id) =>
          setEntries((prev) => prev.filter((entry) => entry.id !== id))
        }
      />
      <div ref={sentinelRef} className="h-6" />
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading more...</p>
      ) : null}
      {!cursor && entries.length > 0 ? <div className="h-1" /> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
