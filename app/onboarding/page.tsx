"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";

import { ScreenShell } from "@/components/app/screen-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
};

type BudgetRow = {
  id: string;
  name: string;
  percent: string;
  locked?: boolean;
};

const SAVINGS_BUDGET_NAME = "Savings / Investments";

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<BudgetRow[]>([
    { id: "savings", name: SAVINGS_BUDGET_NAME, percent: "", locked: true },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileFile) {
      setProfilePreview(null);
      return;
    }
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  const totalPercent = useMemo(
    () => budgets.reduce((sum, row) => sum + parseNumber(row.percent), 0),
    [budgets],
  );

  const savingsPercent =
    parseNumber(
      budgets.find((budget) => budget.name === SAVINGS_BUDGET_NAME)?.percent ?? "",
    ) || 0;

  const canContinue = fullName.trim().length > 0;
  const canFinish = savingsPercent > 0 && totalPercent > 0 && totalPercent <= 100;

  const updateBudget = (id: string, patch: Partial<BudgetRow>) => {
    setBudgets((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addBudget = () => {
    setBudgets((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name: "", percent: "" },
    ]);
  };

  const removeBudget = (id: string) => {
    setBudgets((prev) => prev.filter((row) => row.id !== id || row.locked));
  };

  const handleFinish = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          preferredName,
          budgets,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || "Something went wrong. Try again.");
        return;
      }

      await update({ onboarded: true });
      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell>
      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-12">
        <header className="space-y-4 text-center">
          <div className="flex items-center justify-center">
            <Image
              src="/accrue-logo.svg"
              alt="Accrue logo"
              width={40}
              height={40}
              className="rounded-2xl"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Onboarding
            </p>
            <Badge variant="soft">Step {step} of 2</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="font-display">
              {step === 1
                ? "Set up your account"
                : "Add your monthly budget"}
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {step === 1
              ? "Tell us who you are so your dashboard feels personal."
              : "Add the recurring budgets you expect to manage every month."}
          </p>
        </header>

        {step === 1 ? (
          <section className="space-y-10">
            <div className="flex flex-col items-center gap-10">
              <div className="w-full space-y-4">
                <Label>Profile photo</Label>
                <label className="group relative flex h-40 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 text-sm text-muted-foreground transition-colors hover:border-border overflow-hidden">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-4 px-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background text-xs text-muted-foreground">
                        JPG
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          Upload photo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG or JPG, square works best.
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) =>
                      setProfileFile(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>

              <div className="w-full space-y-7">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Agu Jonas Onyinyechi"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred-name">Preferred name (optional)</Label>
                  <Input
                    id="preferred-name"
                    type="text"
                    placeholder="Jonas"
                    value={preferredName}
                    onChange={(event) => setPreferredName(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-6">
              <p className="text-xs text-muted-foreground">
                You can change these details later in settings.
              </p>
              <Button size="lg" onClick={() => setStep(2)} disabled={!canContinue}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        ) : (
          <section className="space-y-8">
            <div className="space-y-4 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Monthly budget
                </p>
                <p className="text-sm text-muted-foreground">
                  Tell us what percentage of your earnings goes to savings.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/40 bg-muted/10 px-4 py-4">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Total allocated
                  </p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {totalPercent.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.max(0, 100 - totalPercent).toFixed(1)}% remaining
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addBudget}>
                  <Plus className="h-4 w-4" />
                  Add budget
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {budgets.map((row) => (
                <div
                  key={row.id}
                  className="space-y-4 rounded-xl border border-border/40 px-4 py-4"
                >
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {row.locked ? "Savings target" : "Budget name"}
                    </Label>
                    {row.locked ? (
                      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/10 px-4 py-3 text-sm font-medium">
                        {SAVINGS_BUDGET_NAME}
                      </div>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Utilities"
                        value={row.name}
                        onChange={(event) =>
                          updateBudget(row.id, { name: event.target.value })
                        }
                      />
                    )}
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="w-full space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Percent of income
                      </Label>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="10"
                          className="pr-8 text-center"
                          value={row.percent}
                          onChange={(event) =>
                            updateBudget(row.id, { percent: event.target.value })
                          }
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {row.locked
                          ? "This is your main savings / investment target."
                          : `e.g. 10% of my income goes to ${row.name || "this budget"}.`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBudget(row.id)}
                      disabled={budgets.length <= 1 || row.locked}
                      aria-label="Remove budget"
                      className="mb-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPercent > 100 ? (
              <p className="text-sm text-destructive">
                Your allocations exceed 100% by{" "}
                {(totalPercent - 100).toFixed(1)}%. Adjust the percentages to
                continue.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                {Math.max(0, 100 - totalPercent).toFixed(1)}% of your income is
                still unassigned.
              </p>
            )}

            {error ? (
              <p className="text-sm text-destructive text-center">{error}</p>
            ) : null}

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                size="lg"
                disabled={!canFinish || isSubmitting}
                onClick={handleFinish}
              >
                {isSubmitting ? "Saving..." : "Finish setup"}
              </Button>
            </div>
          </section>
        )}
      </div>
    </ScreenShell>
  );
}
