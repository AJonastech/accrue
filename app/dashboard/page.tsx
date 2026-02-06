import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardView } from "@/components/app/dashboard-view";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getShortMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);

const SAVINGS_BUDGET_NAME = "Savings / Investments";

const isSavedAllocation = (name: string) =>
  name.toLowerCase() === SAVINGS_BUDGET_NAME.toLowerCase();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <DashboardView />;
  }

  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfRange = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalIncomeAgg,
    totalAllocationAgg,
    savedAllocationAgg,
    monthIncomeAgg,
    monthSavedAgg,
    budgets,
    rangeIncomes,
    user,
  ] =
    await Promise.all([
      prisma.income.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.incomeAllocation.aggregate({
        where: { income: { userId } },
        _sum: { amount: true },
      }),
      prisma.incomeAllocation.aggregate({
        where: {
          income: { userId },
          name: { equals: SAVINGS_BUDGET_NAME, mode: "insensitive" },
        },
        _sum: { amount: true },
      }),
      prisma.income.aggregate({
        where: { userId, date: { gte: startOfMonth, lt: startOfNextMonth } },
        _sum: { amount: true },
      }),
      prisma.incomeAllocation.aggregate({
        where: {
          income: { userId, date: { gte: startOfMonth, lt: startOfNextMonth } },
          name: { equals: SAVINGS_BUDGET_NAME, mode: "insensitive" },
        },
        _sum: { amount: true },
      }),
      prisma.budget.findMany({
        where: { userId },
        orderBy: { order: "asc" },
        select: { name: true, percent: true },
      }),
      prisma.income.findMany({
        where: { userId, date: { gte: startOfRange, lt: startOfNextMonth } },
        select: {
          date: true,
          allocations: {
            select: {
              name: true,
              amount: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
    ]);

  const totalIncome = totalIncomeAgg._sum.amount ?? 0;
  const totalSaved = savedAllocationAgg._sum.amount ?? 0;
  const totalAllocated = totalAllocationAgg._sum.amount ?? 0;
  const totalExpenses = Math.max(0, totalIncome - totalSaved);

  const monthIncome = monthIncomeAgg._sum.amount ?? 0;
  const monthSaved = monthSavedAgg._sum.amount ?? 0;

  const palette = ["#f97316", "#fdba74", "#fde68a", "#cbd5f5", "#94a3b8"];
  const allocationTotal = budgets.reduce((sum, budget) => sum + budget.percent, 0);
  const allocationData =
    budgets.length > 0
      ? [
          ...budgets.map((budget, index) => ({
            name: budget.name,
            value: Number(budget.percent.toFixed(1)),
            color: palette[index % palette.length],
          })),
          ...(allocationTotal < 100
            ? [
                {
                  name: "Unassigned",
                  value: Number((100 - allocationTotal).toFixed(1)),
                  color: "#e2e8f0",
                },
              ]
            : []),
        ]
      : undefined;

  const monthBuckets = new Map<
    string,
    { label: string; total: number }
  >();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getMonthKey(date);
    monthBuckets.set(key, { label: getShortMonthLabel(date), total: 0 });
  }

  rangeIncomes.forEach((income) => {
    const key = getMonthKey(income.date);
    const bucket = monthBuckets.get(key);
    if (!bucket) return;
    const savedTotal = income.allocations.reduce((sum, allocation) => {
      if (!isSavedAllocation(allocation.name)) return sum;
      return sum + (allocation.amount ?? 0);
    }, 0);
    bucket.total += savedTotal;
  });

  const growthData = Array.from(monthBuckets.values()).map((bucket) => ({
    month: bucket.label,
    saved: Number(bucket.total.toFixed(2)),
  }));

  return (
    <DashboardView
      totalSavedUsd={Number(totalSaved.toFixed(2))}
      totalIncomeUsd={Number(totalIncome.toFixed(2))}
      totalExpensesUsd={Number(totalExpenses.toFixed(2))}
      monthIncomeUsd={Number(monthIncome.toFixed(2))}
      monthSavedUsd={Number(monthSaved.toFixed(2))}
      monthLabel={getMonthLabel(now)}
      growthData={growthData}
      allocationData={allocationData}
      userName={user?.name ?? session.user.name}
    />
  );
}
