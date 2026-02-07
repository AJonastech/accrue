import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { IncomeList } from "@/components/app/income-list";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type Currency = "USD" | "NGN";

export const dynamic = "force-dynamic";

const SAVINGS_BUDGET_NAME = "Savings / Investments";

const currencyMeta: Record<Currency, { locale: string; code: string }> = {
  USD: { locale: "en-US", code: "USD" },
  NGN: { locale: "en-NG", code: "NGN" },
};

const formatCurrency = (value: number, currency: Currency) => {
  const meta = currencyMeta[currency] ?? currencyMeta.USD;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.code,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

export default async function IncomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <DashboardShell>
        <div className="flex flex-col gap-8">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Income
            </h1>
            <p className="text-sm text-muted-foreground">
              Track every deposit and its saved portion.
            </p>
          </header>
          <section className="space-y-3">
            <div className="flex flex-row items-center justify-between">
              <p className="text-base font-semibold">Entries</p>
              <Button size="sm" asChild>
                <Link href="/add-income">
                  <Plus className="h-4 w-4" />
                  Add Income
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in to view your income entries.
            </p>
          </section>
        </div>
      </DashboardShell>
    );
  }

  const incomes = await prisma.income.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 20,
    select: {
      id: true,
      date: true,
      amount: true,
      amountOriginal: true,
      currency: true,
      allocations: {
        select: {
          name: true,
          percent: true,
        },
      },
    },
  });

  const incomeEntries = incomes.map((income) => {
    const currency =
      income.currency?.toUpperCase() === "NGN" ? "NGN" : "USD";
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
      dateLabel: formatDate(income.date),
      amount: amountOriginal,
      amountLabel: formatCurrency(amountOriginal, currency),
      saved,
      savedLabel: formatCurrency(saved, currency),
    };
  });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Income
          </h1>
          <p className="text-sm text-muted-foreground">
            Track every deposit and its saved portion.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <p className="text-base font-semibold">Entries</p>
            <Button size="sm" asChild>
              <Link href="/add-income">
                <Plus className="h-4 w-4" />
                Add Income
              </Link>
            </Button>
          </div>
          {incomeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No income entries yet. Add your first income to see it here.
            </p>
          ) : (
            <IncomeList entries={incomeEntries} />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
