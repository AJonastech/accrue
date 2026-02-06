import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Income
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Income entries
            </h1>
            <p className="text-sm text-muted-foreground">
              Track every deposit and its saved portion.
            </p>
          </header>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Income</CardTitle>
              <Button size="sm" asChild>
                <Link href="/add-income">
                  <Plus className="h-4 w-4" />
                  Add Income
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sign in to view your income entries.
            </CardContent>
          </Card>
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
      date: formatDate(income.date),
      amount: formatCurrency(income.amount ?? 0),
      saved: formatCurrency(saved),
    };
  });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Income
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Income entries
          </h1>
          <p className="text-sm text-muted-foreground">
            Track every deposit and its saved portion.
          </p>
        </header>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Income</CardTitle>
            <Button size="sm" asChild>
              <Link href="/add-income">
                <Plus className="h-4 w-4" />
                Add Income
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No income entries yet. Add your first income to see it here.
              </p>
            ) : null}
            {incomeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl bg-muted/10 px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">{entry.date}</span>
                <span className="font-semibold">
                  {entry.amount}
                  <span className="ml-2 text-xs text-muted-foreground">
                    saved {entry.saved}
                  </span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
