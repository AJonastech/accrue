import Link from "next/link";

import { CurrencyToggle } from "@/components/app/currency-toggle";
import { ScreenHeader } from "@/components/app/screen-header";
import { ScreenShell } from "@/components/app/screen-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const months = [
  { id: "2026-02", label: "February 2026", income: "$2,160", saved: "$1,728", total: "$4,992", progress: 64 },
  { id: "2026-01", label: "January 2026", income: "$1,920", saved: "$1,536", total: "$3,264", progress: 52 },
  { id: "2025-12", label: "December 2025", income: "$2,400", saved: "$1,920", total: "$1,728", progress: 36 },
];

export default function HistoryPage() {
  return (
    <ScreenShell>
      <ScreenHeader
        title="History"
        subtitle="Monthly savings overview."
        rightSlot={<CurrencyToggle size="sm" />}
      />

      <div className="grid gap-4">
        {months.map((month) => (
          <Card key={month.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{month.label}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cumulative saved {month.total}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/history/${month.id}`}>View</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="font-semibold">{month.income}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saved</span>
                <span className="font-semibold">{month.saved}</span>
              </div>
              <Progress value={month.progress} />
            </CardContent>
          </Card>
        ))}
      </div>
    </ScreenShell>
  );
}
