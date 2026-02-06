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
    <aside className="sticky top-10 flex h-[calc(100vh-5rem)] w-56 shrink-0 flex-col border-r border-border/50 bg-transparent px-3 py-4">
      <div className="px-2">
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
  );
}
