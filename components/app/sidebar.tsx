"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { LayoutDashboard, LineChart, Wallet, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "1" },
  { href: "/analytics", label: "Analytics", icon: LineChart, shortcut: "2" },
  { href: "/income", label: "Income", icon: Wallet, shortcut: "3" },
  { href: "/settings", label: "Settings", icon: Settings, shortcut: "4" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const shortcutMap = useMemo(() => {
    const map = new Map<string, string>();
    navItems.forEach((item) => map.set(item.shortcut, item.href));
    return map;
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return;
      const target = shortcutMap.get(event.key);
      if (!target) return;
      event.preventDefault();
      router.push(target);
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [router, shortcutMap]);

  return (
    <>
      <aside className="hidden w-full flex-col border-b border-border/50 px-2 py-3 md:flex md:sticky md:top-10 md:h-[calc(100vh-5rem)] md:w-56 md:shrink-0 md:border-b-0 md:border-r md:px-3 md:py-4">
        <div className="hidden px-2 md:block">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Navigation
          </p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  ⌘{item.shortcut}
                </span>
              </Link>
            );
          })}
        </nav>
{/* 
      <Link
        href="/settings"
        className="rounded-2xl border border-border/60 px-3 py-3 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Currency
        </span>
        <span className="mt-1 block font-medium text-foreground">
          USD / ₦ NGN
        </span>
      </Link> */}
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 rounded-t-xl border-t border-border/40 bg-background/80 px-4 py-2 backdrop-blur-xl shadow-[0_-12px_30px_rgba(15,23,42,0.08)] md:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
