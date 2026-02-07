"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { Bell } from "lucide-react";

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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-6 md:flex-row md:gap-10 md:px-6 md:pb-16 md:pt-10">
        <Sidebar />
        <main className="min-h-screen w-full flex-1 min-w-0">
          <div className="w-full">
            <div className="mb-6 flex items-center justify-between md:hidden">
              <Link href="/settings" className="flex items-center gap-3">
                <Image
                  src="/profile.jpg"
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border border-border/60 object-cover"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Welcome back</p>
                  <p className="text-base font-semibold leading-none">
                    Agu Jonas
                  </p>
                </div>
              </Link>
              <Button asChild variant="ghost" size="icon">
                <Link href="/notifications" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mb-8 hidden flex-col flex-wrap items-start gap-4 border-b border-border/60 pb-6 md:mb-10 md:flex md:flex-row md:items-center md:justify-between">
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
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap md:items-center md:justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                >
                  Sign out
                </Button>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5"
                >
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
                </Link>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
