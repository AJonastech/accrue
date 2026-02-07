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
  const resolvedRightSlot =
    rightSlot === undefined ? <CurrencyToggle size="sm" /> : rightSlot;
  return (
    <header
      className={cn(
        "flex flex-col items-start justify-between gap-3 md:flex-row md:items-end",
        compact ? "py-2" : "py-4 md:py-6",
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          <span className="font-display">{title}</span>
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {resolvedRightSlot ? (
        <div className="flex items-center gap-2">{resolvedRightSlot}</div>
      ) : null}
    </header>
  );
}
