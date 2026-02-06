import { ReactNode } from "react";

import { CurrencyToggle } from "@/components/app/currency-toggle";
import { cn } from "@/lib/utils";

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  compact?: boolean;
};

export function ScreenHeader({
  title = "Accrue",
  subtitle,
  rightSlot,
  compact,
}: ScreenHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col items-start justify-between gap-4 md:flex-row md:items-center",
        compact ? "py-2" : "py-6",
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {subtitle ?? "Save consistently. Watch it grow."}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          <span className="font-display">{title}</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {rightSlot ?? <CurrencyToggle size="sm" />}
      </div>
    </header>
  );
}
