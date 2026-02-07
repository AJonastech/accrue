"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { AccountActions } from "@/components/app/account-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const SAVINGS_BUDGET_NAME = "Savings / Investments";

type SettingsUser = {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  imageKey?: string | null;
  preferredCurrency?: string | null;
  conversionRate?: number | null;
};

type SettingsBudget = {
  id: string;
  name: string;
  percent: number;
};

type BudgetRow = {
  id: string;
  name: string;
  percent: string;
  locked?: boolean;
};

type SettingsFormProps = {
  user: SettingsUser;
  budgets: SettingsBudget[];
};

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
};

const isSavingsBudget = (name: string) =>
  name.toLowerCase() === SAVINGS_BUDGET_NAME.toLowerCase();

export function SettingsForm({ user, budgets }: SettingsFormProps) {
  const [profilePreview, setProfilePreview] = useState<string | null>(
    user.imageUrl ?? null,
  );
  const [profileObjectUrl, setProfileObjectUrl] = useState<string | null>(null);
  const [profileKey, setProfileKey] = useState<string | null>(
    user.imageKey ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState(user.name ?? "");
  const [currency, setCurrency] = useState(
    user.preferredCurrency?.toUpperCase() === "NGN" ? "NGN" : "USD",
  );
  const [conversionRate, setConversionRate] = useState(
    user.conversionRate != null ? String(user.conversionRate) : "",
  );
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [budgetRows, setBudgetRows] = useState<BudgetRow[]>(
    budgets.length > 0
      ? budgets.map((budget) => ({
          id: budget.id,
          name: budget.name,
          percent: String(budget.percent),
          locked: isSavingsBudget(budget.name),
        }))
      : [
          {
            id: "savings",
            name: SAVINGS_BUDGET_NAME,
            percent: "80",
            locked: true,
          },
        ],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (profileObjectUrl) {
        URL.revokeObjectURL(profileObjectUrl);
      }
    };
  }, [profileObjectUrl]);

  const totalPercent = useMemo(
    () => budgetRows.reduce((sum, row) => sum + parseNumber(row.percent), 0),
    [budgetRows],
  );

  const updateBudget = (id: string, patch: Partial<BudgetRow>) => {
    setBudgetRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addBudget = () => {
    setBudgetRows((prev) => [
      ...prev,
      {
        id: `budget-${Date.now()}`,
        name: "",
        percent: "",
      },
    ]);
  };

  const removeBudget = (id: string) => {
    setBudgetRows((prev) =>
      prev.filter((row) => row.id !== id || row.locked),
    );
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    const normalizedBudgets = budgetRows
      .map((row) => ({
        name: row.name.trim(),
        percent: parseNumber(row.percent),
      }))
      .filter((row) => row.name.length > 0 && row.percent > 0);

    if (normalizedBudgets.length === 0) {
      setError("Add at least one allocation.");
      return;
    }

    if (totalPercent > 100) {
      setError("Total allocation cannot exceed 100%.");
      return;
    }

    if (!normalizedBudgets.some((row) => isSavingsBudget(row.name))) {
      setError("Savings allocation is required.");
      return;
    }

    if (isUploading) {
      setError("Image upload in progress. Please wait.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          preferredCurrency: currency,
          conversionRate,
          budgets: normalizedBudgets,
          imageKey: profileKey ?? undefined,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || "Unable to save settings.");
        return;
      }

      setSuccess("Settings updated.");
      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: {
            name: fullName,
            image: profileKey,
          },
        }),
      );
    } catch (err) {
      setError("Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchRate = async () => {
      setIsFetchingRate(true);
      try {
        const response = await fetch("/api/rates?base=usd&target=ngn");
        if (!response.ok) return;
        const data = await response.json();
        if (!active || typeof data?.rate !== "number") return;
        setConversionRate(String(data.rate));
      } catch (err) {
        // Keep the last saved rate if live fetch fails.
      } finally {
        if (active) {
          setIsFetchingRate(false);
        }
      }
    };

    fetchRate();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, currency, and allocation rules.
        </p>
      </header>

      <section className="space-y-8">
        <div className="mx-auto w-full max-w-md space-y-4">
          <Label>Profile photo</Label>
          <label
            className={`group relative flex h-40 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 text-sm text-muted-foreground transition-colors hover:border-border overflow-hidden ${
              isUploading ? "pointer-events-none" : ""
            }`}
            aria-busy={isUploading}
          >
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Profile preview"
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
                  isUploading ? "opacity-60" : "opacity-100"
                }`}
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
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                  Uploading image...
                </div>
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const previousPreview = profilePreview;
                const previousKey = profileKey;
                if (profileObjectUrl) {
                  URL.revokeObjectURL(profileObjectUrl);
                }
                const objectUrl = URL.createObjectURL(file);
                setProfileObjectUrl(objectUrl);
                setProfilePreview(objectUrl);
                setError(null);
                setSuccess(null);
                setIsUploading(true);
                try {
                  const response = await fetch("/api/uploads/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      filename: file.name,
                      contentType: file.type,
                    }),
                  });

                  if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || "Upload failed");
                  }

                  const { uploadUrl, key } = await response.json();
                  const uploadResponse = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": file.type },
                    body: file,
                  });

                  if (!uploadResponse.ok) {
                    throw new Error("Upload failed");
                  }

                  setProfileKey(key);
                } catch (err) {
                  if (profileObjectUrl) {
                    URL.revokeObjectURL(profileObjectUrl);
                    setProfileObjectUrl(null);
                  }
                  setProfilePreview(previousPreview);
                  setProfileKey(previousKey);
                  setError("Unable to upload image. Try again.");
                } finally {
                  setIsUploading(false);
                }
              }}
            />
          </label>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Full name</Label>
            <Input
              id="settings-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={user.email ?? ""}
              disabled
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Currency Settings</p>
          <p className="text-sm text-muted-foreground">
            Live USD to NGN conversion rate.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="NGN">NGN (₦)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Conversion Rate</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="rate"
                type="number"
                inputMode="decimal"
                value={conversionRate}
                placeholder={isFetchingRate ? "Updating..." : "—"}
                readOnly
                aria-readonly="true"
              />
              {isFetchingRate ? (
                <span className="text-xs text-muted-foreground">
                  Updating…
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Allocation Settings</p>
          <p className="text-sm text-muted-foreground">
            Changes apply to future income only.
          </p>
        </div>

        <div className="space-y-4">
          {budgetRows.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 md:grid-cols-[1.6fr_140px_auto] md:items-end"
            >
              <div className="space-y-2">
                <Label>Budget name</Label>
                <Input
                  value={row.name}
                  onChange={(event) =>
                    updateBudget(row.id, { name: event.target.value })
                  }
                  disabled={row.locked}
                />
              </div>
              <div className="space-y-2">
                <Label>Percent</Label>
                <div className="relative">
                  <Input
                    value={row.percent}
                    onChange={(event) =>
                      updateBudget(row.id, { percent: event.target.value })
                    }
                    inputMode="decimal"
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => removeBudget(row.id)}
                  disabled={row.locked}
                  aria-label="Remove budget"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" size="sm" onClick={addBudget}>
            <Plus className="h-4 w-4" />
            Add budget
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Total allocation
            </span>
            <Badge variant="secondary">{totalPercent.toFixed(1)}%</Badge>
          </div>
        </div>
      </section>

      {isUploading ? (
        <Alert variant="subtle">
          <AlertTitle>Uploading image</AlertTitle>
          <AlertDescription>Hang tight while we finish the upload.</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="error">
          <AlertTitle>Unable to save</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert variant="success">
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={isSaving || isUploading}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Separator />

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Account actions</p>
          <p className="text-sm text-muted-foreground">
            Sign out on this device or delete your account permanently.
          </p>
        </div>
        <AccountActions />
      </section>
    </div>
  );
}
