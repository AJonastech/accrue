import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ScreenShellProps = {
  children: ReactNode;
  className?: string;
};

export function ScreenShell({ children, className }: ScreenShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background px-6 pb-16 pt-10",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {children}
      </div>
    </div>
  );
}
