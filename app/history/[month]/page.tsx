import { CalendarDays } from "lucide-react";

import { CurrencyToggle } from "@/components/app/currency-toggle";
import { ScreenHeader } from "@/components/app/screen-header";
import { ScreenShell } from "@/components/app/screen-shell";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const entries = [
  { date: "Feb 3, 2026", amount: "$1,200", saved: "$960" },
  { date: "Feb 12, 2026", amount: "$600", saved: "$480" },
  { date: "Feb 26, 2026", amount: "$360", saved: "$288" },
];

export default function MonthDetailPage({
  params,
}: {
  params: { month: string };
}) {
  const label = params.month.replace("-", " ");

  return (
    <ScreenShell>
      <ScreenHeader
        title={`Month Detail`}
        subtitle={`Details for ${label}`}
        rightSlot={<CurrencyToggle size="sm" />}
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold">Totals</p>
            <p className="text-sm text-muted-foreground">
              Converted using your set rate.
            </p>
          </div>
          <Badge variant="soft">February 2026</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-muted/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Income
            </p>
            <p className="text-xl font-semibold">$2,160</p>
          </div>
          <div className="rounded-2xl bg-muted/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Saved
            </p>
            <p className="text-xl font-semibold text-primary">$1,728</p>
          </div>
          <div className="rounded-2xl bg-muted/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Cumulative
            </p>
            <p className="text-xl font-semibold">$4,992</p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <p className="text-base font-semibold">Income Entries</p>
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={entry.date}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {entry.date}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{entry.amount}</p>
                  <p className="text-xs text-muted-foreground">
                    Saved {entry.saved}
                  </p>
                </div>
              </div>
              {index < entries.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </section>
    </ScreenShell>
  );
}
