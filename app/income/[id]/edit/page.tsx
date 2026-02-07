import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { IncomeForm } from "@/components/app/income-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditIncomePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [income, budgets, user] = await Promise.all([
    prisma.income.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        allocations: {
          select: {
            id: true,
            name: true,
            percent: true,
            description: true,
          },
        },
      },
    }),
    prisma.budget.findMany({
      where: { userId: session.user.id },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { conversionRate: true },
    }),
  ]);

  if (!income) {
    notFound();
  }

  const amountForEdit =
    income.amountOriginal && income.amountOriginal > 0
      ? income.amountOriginal
      : income.amount ?? 0;

  return (
    <IncomeForm
      mode="edit"
      initialData={{
        id: income.id,
        amount: amountForEdit,
        currency: income.currency ?? "USD",
        date: income.date.toISOString(),
        allocations: income.allocations.map((allocation) => ({
          id: allocation.id,
          name: allocation.name,
          percent: allocation.percent,
          description: allocation.description ?? "",
        })),
      }}
      conversionRate={user?.conversionRate ?? 1500}
      budgetNames={budgets.map((budget) => budget.name)}
    />
  );
}
