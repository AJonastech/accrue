"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Plus, X } from "lucide-react";

import { CurrencyToggle } from "@/components/app/currency-toggle";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { ScreenHeader } from "@/components/app/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_ALLOCATIONS = [
  {
    id: "savings",
    name: "Savings / Investments",
    percent: 80,
    description: "",
    isCore: true,
  },
];

type AllocationRow = {
  id: string;
  name: string;
  percent: number;
  description: string;
  isCore?: boolean;
};

type IncomeFormInitial = {
  id: string;
  amount: number;
  date: string;
  allocations: {
    id?: string;
    name: string;
    percent: number;
    description?: string | null;
  }[];
};

type IncomeFormProps = {
  mode?: "create" | "edit";
  initialData?: IncomeFormInitial;
  budgetNames?: string[];
};

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);

const isBudgetMatch = (name: string, budgets?: string[]) => {
  if (!budgets || budgets.length === 0) return true;
  return budgets.some(
    (budget) => budget.toLowerCase() === name.toLowerCase(),
  );
};

export function IncomeForm({
  mode = "create",
  initialData,
  budgetNames,
}: IncomeFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit" && !!initialData;
  const [amountInput, setAmountInput] = useState(() =>
    isEditMode ? String(initialData.amount ?? "") : "",
  );
  const [date, setDate] = useState<Date | undefined>(() =>
    isEditMode && initialData?.date ? new Date(initialData.date) : new Date(),
  );
  const [allocations, setAllocations] = useState<AllocationRow[]>(() =>
    isEditMode && initialData
      ? initialData.allocations.map((allocation, index) => ({
          id: allocation.id ?? `alloc-${index}`,
          name: allocation.name,
          percent: Number(allocation.percent) || 0,
          description: allocation.description ?? "",
          isCore: isBudgetMatch(allocation.name, budgetNames),
        }))
      : DEFAULT_ALLOCATIONS,
  );
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(!isEditMode);

  const amountValue = useMemo(
    () => parseNumber(amountInput),
    [amountInput],
  );

  const totalPercent = useMemo(
    () => allocations.reduce((sum, row) => sum + (row.percent || 0), 0),
    [allocations],
  );

  const remainingPercent = Math.max(0, 100 - totalPercent);
  const isOverAllocated = totalPercent > 100;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  const allocationAmount = (percent: number) => {
    if (!amountValue || amountValue <= 0) return "";
    const value = (amountValue * percent) / 100;
    return value.toFixed(2);
  };

  const updateAllocation = (id: string, patch: Partial<AllocationRow>) => {
    setAllocations((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const handlePercentChange = (id: string, value: string) => {
    const parsed = parseNumber(value);
    updateAllocation(id, { percent: parsed ?? 0 });
  };

  const handleAmountChange = (id: string, value: string) => {
    const parsed = parseNumber(value);
    if (!amountValue || amountValue <= 0) {
      updateAllocation(id, { percent: 0 });
      return;
    }
    if (parsed === null) {
      updateAllocation(id, { percent: 0 });
      return;
    }
    const nextPercent = (parsed / amountValue) * 100;
    updateAllocation(id, { percent: Number(nextPercent.toFixed(2)) });
  };

  const addBudget = () => {
    const id = `custom-${Date.now()}`;
    setAllocations((prev) => [
      ...prev,
      {
        id,
        name: "",
        percent: 0,
        description: "",
      },
    ]);
    setRecentlyAddedId(id);
  };

  const removeBudget = (id: string) => {
    setAllocations((prev) => prev.filter((row) => row.id !== id));
  };

  useEffect(() => {
    if (!recentlyAddedId) return;
    const timeout = setTimeout(() => setRecentlyAddedId(null), 450);
    return () => clearTimeout(timeout);
  }, [recentlyAddedId]);

  useEffect(() => {
    if (isEditMode || budgetNames) {
      setIsLoadingBudgets(false);
      return;
    }

    const loadBudgets = async () => {
      try {
        const response = await fetch("/api/budgets");
        if (!response.ok) throw new Error("Failed to load budgets");
        const data = await response.json();
        if (Array.isArray(data.budgets) && data.budgets.length > 0) {
          setAllocations(
            data.budgets.map(
              (budget: { id: string; name: string; percent: number }) => ({
                id: budget.id,
                name: budget.name,
                percent: Number(budget.percent) || 0,
                description: "",
                isCore: true,
              }),
            ),
          );
        }
      } catch (error) {
        setSubmitError("Unable to load your allocations. Try again.");
      } finally {
        setIsLoadingBudgets(false);
      }
    };

    loadBudgets();
  }, [budgetNames, isEditMode]);

  const coreAllocations = allocations.filter((row) => row.isCore);
  const customAllocations = allocations.filter((row) => !row.isCore);

  const canSubmit =
    !!amountValue &&
    amountValue > 0 &&
    !!date &&
    !isOverAllocated &&
    totalPercent > 0;

  const handleSave = async () => {
    if (!canSubmit || !date || !amountValue) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const endpoint = isEditMode
        ? `/api/income/${initialData.id}`
        : "/api/income";
      const response = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountValue,
          date: date.toISOString(),
          allocations: allocations.map((row) => ({
            name: row.name,
            percent: row.percent,
            description: row.description,
          })),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setSubmitError(message || "Unable to save income entry.");
        return;
      }

      router.push("/income");
    } catch (error) {
      setSubmitError("Unable to save income entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-10">
        <ScreenHeader
          title={isEditMode ? "Edit Income" : "Add Income"}
          subtitle={
            isEditMode ? "Update income details." : "Capture income quickly."
          }
          rightSlot={<CurrencyToggle size="sm" />}
        />

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Income details
            </p>
            <p className="text-sm text-muted-foreground">
              Enter the amount and date. Allocations update instantly.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="income-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="2,160"
                  className="pl-8"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-start rounded-2xl border-input text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDate(date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Allocation breakdown
              </p>
              <p className="text-sm text-muted-foreground">
                Predefined allocations apply first. Adjust anytime.
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">
                {totalPercent.toFixed(1)}% allocated
              </p>
              <p>
                {remainingPercent.toFixed(1)}% remaining
                {amountValue
                  ? ` • ${formatCurrency(
                      (amountValue * remainingPercent) / 100,
                    )} unallocated`
                  : ""}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Core allocations</p>
              <Badge variant="soft">Auto-applied</Badge>
            </div>
            {isLoadingBudgets ? (
              <p className="text-sm text-muted-foreground">
                Loading your allocations...
              </p>
            ) : null}
            {coreAllocations.map((row) => (
              <div
                key={row.id}
                className="space-y-4 rounded-xl border border-border/40 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {row.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Required
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-[160px_180px]">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Percent
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={
                          Number.isFinite(row.percent) ? String(row.percent) : ""
                        }
                        onChange={(event) =>
                          handlePercentChange(row.id, event.target.value)
                        }
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Amount
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={allocationAmount(row.percent)}
                        onChange={(event) =>
                          handleAmountChange(row.id, event.target.value)
                        }
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Optional context"
                    value={row.description}
                    onChange={(event) =>
                      updateAllocation(row.id, {
                        description: event.target.value,
                      })
                    }
                    className="min-h-[72px] resize-none rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Additional budgets</p>
              <Button variant="outline" size="sm" onClick={addBudget}>
                <Plus className="h-4 w-4" />
                Add budget
              </Button>
            </div>
            {customAllocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add optional budgets for this income entry, like Food or
                Transport.
              </p>
            ) : (
              <div className="space-y-4">
                {customAllocations.map((row) => (
                  <div
                    key={row.id}
                    className={`space-y-4 rounded-xl border border-border/40 px-4 py-4 transition-all ${
                      row.id === recentlyAddedId
                        ? "animate-in fade-in slide-in-from-bottom-2"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Input
                        placeholder="Budget name"
                        value={row.name}
                        onChange={(event) =>
                          updateAllocation(row.id, { name: event.target.value })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBudget(row.id)}
                        className="h-10 w-10 rounded-full"
                        aria-label="Remove budget"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[160px_180px]">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Percent
                        </Label>
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={
                              Number.isFinite(row.percent)
                                ? String(row.percent)
                                : ""
                            }
                            onChange={(event) =>
                              handlePercentChange(row.id, event.target.value)
                            }
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={allocationAmount(row.percent)}
                            onChange={(event) =>
                              handleAmountChange(row.id, event.target.value)
                            }
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                      <Textarea
                        placeholder="Optional context"
                        value={row.description}
                        onChange={(event) =>
                          updateAllocation(row.id, {
                            description: event.target.value,
                          })
                        }
                        className="min-h-[72px] resize-none rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isOverAllocated ? (
            <p className="text-sm text-destructive">
              Allocations exceed 100% by {(totalPercent - 100).toFixed(1)}%. The
              income cannot be saved until this is resolved.
            </p>
          ) : null}

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
        </section>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Saved allocations update instantly and apply to this entry only.
          </p>
          <Button
            size="lg"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSave}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Income"
                : "Save Income"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
