import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const SAVINGS_BUDGET_NAME = "Savings / Investments";

const parseNumber = (value: string | number) => {
  const raw = typeof value === "number" ? String(value) : value;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const budgets: { name?: string; percent?: string | number }[] =
    Array.isArray(body.budgets) ? body.budgets : [];

  const normalizedBudgets: { name: string; percent: number }[] = budgets
    .map((budget) => ({
      name: String(budget.name ?? "").trim(),
      percent: parseNumber(budget.percent ?? 0),
    }))
    .filter((budget) => budget.name.length > 0 && budget.percent > 0);

  if (normalizedBudgets.length === 0) {
    return new Response("At least one budget is required", { status: 400 });
  }

  const totalPercent = normalizedBudgets.reduce(
    (sum, budget) => sum + budget.percent,
    0,
  );

  const savingsBudget = normalizedBudgets.find(
    (budget) => budget.name.toLowerCase() === SAVINGS_BUDGET_NAME.toLowerCase(),
  );

  if (!savingsBudget || savingsBudget.percent <= 0) {
    return new Response("Savings target is required", { status: 400 });
  }

  if (totalPercent > 100) {
    return new Response("Total allocation cannot exceed 100%", {
      status: 400,
    });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName || undefined,
        onboarded: true,
      },
    }),
    prisma.budget.deleteMany({
      where: { userId: session.user.id },
    }),
    prisma.budget.createMany({
      data: normalizedBudgets.map((budget, index) => ({
        userId: session.user.id,
        name: budget.name,
        percent: budget.percent,
        order: index,
      })),
    }),
  ]);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
