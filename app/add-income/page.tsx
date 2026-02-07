import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { IncomeForm } from "@/components/app/income-form";
import { prisma } from "@/lib/prisma";

export default async function AddIncomePage() {
  const session = await getServerSession(authOptions);

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { conversionRate: true },
      })
    : null;

  return <IncomeForm mode="create" conversionRate={user?.conversionRate ?? 1500} />;
}
