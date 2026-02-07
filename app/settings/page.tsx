import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { SettingsForm } from "@/components/app/settings-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [user, budgets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        preferredCurrency: true,
        conversionRate: true,
      },
    }),
    prisma.budget.findMany({
      where: { userId: session.user.id },
      orderBy: { order: "asc" },
      select: { id: true, name: true, percent: true },
    }),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  const imageKey = user.image ?? null;
  let imageUrl: string | null = imageKey;
  if (imageKey && !imageKey.startsWith("http") && !imageKey.startsWith("data:")) {
    const encoded = encodeURIComponent(imageKey).replace(/%2F/g, "/");
    imageUrl = `/api/images/${encoded}`;
  }

  return (
    <DashboardShell>
      <SettingsForm
        user={{
          name: user.name,
          email: user.email,
          imageUrl,
          imageKey,
          preferredCurrency: user.preferredCurrency,
          conversionRate: user.conversionRate,
        }}
        budgets={budgets}
      />
    </DashboardShell>
  );
}
