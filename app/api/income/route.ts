import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mapIncomeToEntry } from "@/lib/income";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const parseNumber = (value: string | number) => {
  const raw = typeof value === "number" ? String(value) : value;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
};

const normalizeCurrency = (value: string | undefined) =>
  value?.toUpperCase() === "NGN" ? "NGN" : "USD";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitParam = Number(searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 5), 50)
    : 20;

  const incomes = await prisma.income.findMany({
    where: { userId: session.user.id },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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

  const hasMore = incomes.length > limit;
  const slice = hasMore ? incomes.slice(0, limit) : incomes;
  const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;

  return new Response(
    JSON.stringify({
      entries: slice.map((income) => mapIncomeToEntry(income)),
      nextCursor,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { conversionRate: true },
  });

  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const body = await request.json();
  const amountOriginal = parseNumber(body.amount ?? 0);
  const currency = normalizeCurrency(body.currency);
  const conversionRate = Number(user.conversionRate ?? 0);
  const amount =
    currency === "USD"
      ? amountOriginal
      : conversionRate > 0
        ? amountOriginal / conversionRate
        : 0;
  const date = new Date(body.date ?? "");
  const allocations: {
    name?: string;
    percent?: string | number;
    description?: string;
  }[] = Array.isArray(body.allocations) ? body.allocations : [];

  if (!amountOriginal || amountOriginal <= 0) {
    return new Response("Amount must be greater than zero", { status: 400 });
  }

  if (Number.isNaN(date.getTime())) {
    return new Response("Invalid date", { status: 400 });
  }

  if (!amount || amount <= 0) {
    return new Response("Invalid conversion rate", { status: 400 });
  }

  const normalizedAllocations: {
    name: string;
    percent: number;
    description?: string;
  }[] = allocations
    .map((allocation) => ({
      name: String(allocation.name ?? "").trim(),
      percent: parseNumber(allocation.percent ?? 0),
      description: allocation.description ? String(allocation.description) : undefined,
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

  const created = await prisma.income.create({
    data: {
      userId: session.user.id,
      amount,
      amountOriginal,
      currency,
      date,
      allocations: {
        create: normalizedAllocations.map((allocation) => ({
          name: allocation.name,
          percent: allocation.percent,
          amount: (amount * allocation.percent) / 100,
          description: allocation.description,
        })),
      },
    },
  });

  return new Response(JSON.stringify({ ok: true, id: created.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
