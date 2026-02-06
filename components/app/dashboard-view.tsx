"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { AllocationChart } from "@/components/app/allocation-chart";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { GrowthChart } from "@/components/app/growth-chart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatCurrency,
  maskCurrency,
  type Currency,
} from "@/lib/format";

const USD_TO_NGN = 1500;

type DashboardViewProps = {
  totalSavedUsd?: number;
  totalIncomeUsd?: number;
  totalExpensesUsd?: number;
  monthIncomeUsd?: number;
  monthSavedUsd?: number;
  monthLabel?: string;
  growthData?: { month: string; saved: number }[];
  allocationData?: { name: string; value: number; color: string }[];
  userName?: string | null;
};

export function DashboardView({
  totalSavedUsd = 19540,
  totalIncomeUsd = 27900,
  totalExpensesUsd = 8360,
  monthIncomeUsd = 720,
  monthSavedUsd = 576,
  monthLabel = "February 2026",
  growthData,
  allocationData,
  userName,
}: DashboardViewProps) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [allocationScope, setAllocationScope] = useState("all");

  const allocationItems =
    allocationData ?? [
      { name: "Savings", value: 70, color: "#f97316" },
      { name: "Category A", value: 15, color: "#fdba74" },
      { name: "Category B", value: 15, color: "#cbd5f5" },
    ];

  const monthSavedPercent =
    monthIncomeUsd > 0 ? Math.round((monthSavedUsd / monthIncomeUsd) * 100) : 0;

  const maskedValue = useMemo(() => maskCurrency(currency), [currency]);

  const displayValue = (valueUsd: number) =>
    privacyMode ? maskedValue : formatCurrency(valueUsd, currency, USD_TO_NGN);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-10">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border/60 pb-6">
          <div className="space-y-2">
          
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Overview for{" "}
              <span className="text-primary">{userName ?? "Your account"}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Clear, calm insight into how your money grows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm" asChild>
              <Link href="/add-income">Add Income</Link>
            </Button>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Total Saved
            </p>
            <Tabs
              value={currency}
              onValueChange={(value) => setCurrency(value as Currency)}
            >
              <TabsList className="h-8">
                <TabsTrigger value="USD" className="px-3 text-xs">
                  USD
                </TabsTrigger>
                <TabsTrigger value="NGN" className="px-3 text-xs">
                  ₦ NGN
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="flex items-center gap-3">
              <p className="text-5xl font-semibold tracking-tight md:text-6xl">
                <span className="font-display">
                  {displayValue(totalSavedUsd)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setPrivacyMode((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={privacyMode ? "Show balances" : "Hide balances"}
              >
                {privacyMode ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="w-full max-w-md space-y-3 text-sm lg:w-auto lg:justify-self-end">
              <div className="grid gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Total income
                  </p>
                  <p className="text-lg font-semibold">
                    {displayValue(totalIncomeUsd)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Total expenses
                  </p>
                  <p className="text-lg font-semibold">
                    {displayValue(totalExpensesUsd)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Since you started tracking.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        <div className="grid items-stretch gap-8 lg:grid-cols-[1.3fr_1fr]">
          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Growth Over Time</p>
              <p className="text-xs text-muted-foreground">
                Cumulative savings by month
              </p>
            </div>
            <div className="h-[300px] rounded-3xl border border-border/60 bg-muted/10 p-5">
              <GrowthChart
                currency={currency}
                rate={USD_TO_NGN}
                masked={privacyMode}
                data={growthData}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Allocation Breakdown</p>
                <p className="text-xs text-muted-foreground">
                  How your income is allocated
                </p>
              </div>
              <Tabs
                value={allocationScope}
                onValueChange={setAllocationScope}
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="px-3 text-xs">
                    All time
                  </TabsTrigger>
                  <TabsTrigger value="month" className="px-3 text-xs">
                    This month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid h-[300px] gap-6 rounded-3xl border border-border/60 bg-muted/10 p-5 md:grid-cols-[180px_1fr] md:items-center">
              <div className="h-full w-full">
                <AllocationChart data={allocationItems} />
              </div>
              <div className="space-y-2 text-sm">
                {allocationItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  {allocationScope === "all"
                    ? "All-time allocation averages."
                    : "Allocation for the current month."}{" "}
                  Customize categories in Settings.
                </p>
              </div>
            </div>
          </section>
        </div>

        <Separator />

        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold">This Month</p>
            <p className="text-xs text-muted-foreground">
              {monthLabel} snapshot
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-border/60 bg-muted/10 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Income</span>
              <span className="font-semibold">
                {displayValue(monthIncomeUsd)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Saved</span>
              <span className="font-semibold">
                {displayValue(monthSavedUsd)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>% saved this month</span>
              <span className="font-semibold text-foreground">
                {monthSavedPercent}%
              </span>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
