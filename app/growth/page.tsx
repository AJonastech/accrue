import { CurrencyToggle } from "@/components/app/currency-toggle";
import { ScreenHeader } from "@/components/app/screen-header";
import { ScreenShell } from "@/components/app/screen-shell";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function GrowthPage() {
  return (
    <ScreenShell>
      <ScreenHeader
        title="Savings Growth"
        subtitle="Cumulative progress over time."
        rightSlot={<CurrencyToggle size="sm" />}
      />

      <section className="space-y-6">
        <div className="flex flex-row items-center justify-between">
          <div>
            <p className="text-base font-semibold">Growth Chart</p>
            <p className="text-sm text-muted-foreground">
              No predictions, just progress.
            </p>
          </div>
          <Badge variant="soft">Y-axis in $</Badge>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-muted/30 via-background to-muted/10 p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>$5,000</span>
              <span>$2,500</span>
              <span>$0</span>
            </div>
            <svg
              viewBox="0 0 400 160"
              className="mt-4 h-40 w-full"
              role="img"
              aria-label="Savings growth chart"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
                </linearGradient>
              </defs>
              <path
                d="M10 130 C60 120, 90 110, 130 90 C170 70, 210 80, 250 60 C290 40, 330 35, 390 20"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M10 130 C60 120, 90 110, 130 90 C170 70, 210 80, 250 60 C290 40, 330 35, 390 20 L390 160 L10 160 Z"
                fill="hsl(var(--primary) / 0.12)"
              />
            </svg>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
            </div>
          </div>
          <Separator />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-muted/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Current
              </p>
              <p className="text-xl font-semibold">$4,992</p>
            </div>
            <div className="rounded-2xl bg-muted/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Best Month
              </p>
              <p className="text-xl font-semibold text-primary">$1,920</p>
            </div>
            <div className="rounded-2xl bg-muted/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Average
              </p>
              <p className="text-xl font-semibold">$1,661</p>
            </div>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
