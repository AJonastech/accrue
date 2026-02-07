import { DashboardShell } from "@/components/app/dashboard-shell";

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Expand on your income patterns and allocation trends.
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-sm font-semibold">Analytics Overview</p>
          <p className="text-sm text-muted-foreground">
            Add charts here for category splits, monthly comparisons, and income
            cadence. This screen stays focused on deeper insights.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
