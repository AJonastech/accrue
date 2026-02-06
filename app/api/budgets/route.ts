import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      percent: true,
    },
  });

  return new Response(JSON.stringify({ budgets }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
