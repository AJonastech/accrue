import type { Currency } from "@/lib/format";

const SAVINGS_BUDGET_NAME = "Savings / Investments";

export type IncomeEntry = {
  id: string;
  date: string;
  dateLabel: string;
  amount: number;
  amountLabel: string;
  saved: number;
  savedLabel: string;
};

type IncomeRow = {
  id: string;
  date: Date;
  amount?: number | null;
  amountOriginal?: number | null;
  currency?: string | null;
  allocations: { name: string; percent?: number | null }[];
};

const currencyMeta: Record<Currency, { locale: string; code: string }> = {
  USD: { locale: "en-US", code: "USD" },
  NGN: { locale: "en-NG", code: "NGN" },
};

export const normalizeCurrency = (value?: string | null): Currency =>
  value?.toUpperCase() === "NGN" ? "NGN" : "USD";

export const formatDateLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

export const formatCurrencyValue = (value: number, currency: Currency) => {
  const meta = currencyMeta[currency] ?? currencyMeta.USD;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.code,
    maximumFractionDigits: 2,
  }).format(value);
};

export const mapIncomeToEntry = (income: IncomeRow): IncomeEntry => {
  const currency = normalizeCurrency(income.currency);
  const amountOriginal =
    income.amountOriginal && income.amountOriginal > 0
      ? income.amountOriginal
      : income.amount ?? 0;
  const savingsPercent = income.allocations.reduce((sum, allocation) => {
    if (allocation.name.toLowerCase() !== SAVINGS_BUDGET_NAME.toLowerCase()) {
      return sum;
    }
    return sum + (allocation.percent ?? 0);
  }, 0);
  const saved = (amountOriginal * savingsPercent) / 100;

  return {
    id: income.id,
    date: income.date.toISOString(),
    dateLabel: formatDateLabel(income.date),
    amount: amountOriginal,
    amountLabel: formatCurrencyValue(amountOriginal, currency),
    saved,
    savedLabel: formatCurrencyValue(saved, currency),
  };
};
