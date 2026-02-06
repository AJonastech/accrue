"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";

import { Sidebar } from "@/components/app/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto flex w-full max-w-7xl gap-10 px-6 pb-16 pt-10">
        <Sidebar />
        <main className="min-h-screen w-full flex-1 min-w-0">
          <div className="w-full">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
             <div className="flex items-center gap-3">
              <Image
                src="/accrue-logo.svg"
                alt="Accrue logo"
                width={40}
                height={40}
                className="rounded-2xl"
              />
              <div>
                <p className="text-sm font-semibold tracking-tight">Accrue</p>
                <p className="text-xs text-muted-foreground">
                  Personal finance overview
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
              >
                Sign out
              </Button>
              <div className="flex items-center gap-3 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5">
              <div className="text-right text-[11px] text-muted-foreground">
                <p className="text-sm font-medium leading-none text-foreground">
                  Agu Jonas
                </p>
                <p className="leading-none">Account</p>
              </div>
              <Image
                src="/profile.jpg"
                alt="User avatar"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full border border-border/60 object-cover"
              />
              </div>
            </div>
          </div>
          {children}
          </div>
        </main>
      </div>
    </div>
  );
}
