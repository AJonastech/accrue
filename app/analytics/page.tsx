import { DashboardShell } from "@/components/app/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Analytics
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Deeper charts & breakdowns
          </h1>
          <p className="text-sm text-muted-foreground">
            Expand on your income patterns and allocation trends.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analytics Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add charts here for category splits, monthly comparisons, and income
            cadence. This screen stays focused on deeper insights.
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
