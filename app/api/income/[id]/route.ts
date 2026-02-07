import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const parseNumber = (value: string | number) => {
  const raw = typeof value === "number" ? String(value) : value;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const income = await prisma.income.findFirst({
    where: { id, userId: session.user.id },
    include: {
      allocations: {
        select: {
          id: true,
          name: true,
          percent: true,
          amount: true,
          description: true,
        },
      },
    },
  });

  if (!income) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(
    JSON.stringify({
      id: income.id,
      amount: income.amount,
      date: income.date.toISOString(),
      allocations: income.allocations,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.income.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return new Response("Not found", { status: 404 });
  }

  const body = await request.json();
  const amount = parseNumber(body.amount ?? 0);
  const date = new Date(body.date ?? "");
  const allocations: {
    name?: string;
    percent?: string | number;
    description?: string;
  }[] = Array.isArray(body.allocations) ? body.allocations : [];

  if (!amount || amount <= 0) {
    return new Response("Amount must be greater than zero", { status: 400 });
  }

  if (Number.isNaN(date.getTime())) {
    return new Response("Invalid date", { status: 400 });
  }

  const normalizedAllocations: {
    name: string;
    percent: number;
    description?: string;
  }[] = allocations
    .map((allocation) => ({
      name: String(allocation.name ?? "").trim(),
      percent: parseNumber(allocation.percent ?? 0),
      description: allocation.description
        ? String(allocation.description)
        : undefined,
    }))
    .filter((allocation) => allocation.name.length > 0 && allocation.percent > 0);

  const totalPercent = normalizedAllocations.reduce(
    (sum, allocation) => sum + allocation.percent,
    0,
  );

  if (totalPercent > 100) {
    return new Response("Total allocation cannot exceed 100%", {
      status: 400,
    });
  }

  await prisma.$transaction([
    prisma.income.update({
      where: { id },
      data: { amount, date },
    }),
    prisma.incomeAllocation.deleteMany({
      where: { incomeId: id },
    }),
    prisma.incomeAllocation.createMany({
      data: normalizedAllocations.map((allocation) => ({
        incomeId: id,
        name: allocation.name,
        percent: allocation.percent,
        amount: (amount * allocation.percent) / 100,
        description: allocation.description,
      })),
    }),
  ]);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
