import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { IncomeList } from "@/components/app/income-list";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SAVINGS_BUDGET_NAME = "Savings / Investments";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

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
      allocations: {
        select: {
          name: true,
          amount: true,
        },
      },
    },
  });

  const incomeEntries = incomes.map((income) => {
    const saved = income.allocations.reduce((sum, allocation) => {
      if (allocation.name.toLowerCase() !== SAVINGS_BUDGET_NAME.toLowerCase()) {
        return sum;
      }
      return sum + (allocation.amount ?? 0);
    }, 0);

    return {
      id: income.id,
      date: income.date.toISOString(),
      dateLabel: formatDate(income.date),
      amount: income.amount ?? 0,
      amountLabel: formatCurrency(income.amount ?? 0),
      saved,
      savedLabel: formatCurrency(saved),
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
