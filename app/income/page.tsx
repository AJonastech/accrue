import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { IncomeFeed } from "@/components/app/income-feed";
import { Button } from "@/components/ui/button";
import { mapIncomeToEntry } from "@/lib/income";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

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
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
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

  const hasMore = incomes.length > PAGE_SIZE;
  const slice = hasMore ? incomes.slice(0, PAGE_SIZE) : incomes;
  const incomeEntries = slice.map((income) => mapIncomeToEntry(income));
  const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;

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
          {incomeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No income entries yet. Add your first income to see it here.
            </p>
          ) : (
            <IncomeFeed
              initialEntries={incomeEntries}
              initialCursor={nextCursor}
            />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
