import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 pb-20 pt-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/accrue-logo.svg"
              alt="Accrue logo"
              width={36}
              height={36}
              className="rounded-2xl"
            />
            <div>
              <p className="text-sm font-semibold tracking-tight">Accrue</p>
              <p className="text-xs text-muted-foreground">
                Calm money tracking
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/onboarding">Get started</Link>
          </Button>
        </header>
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Accrue
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Save consistently. Watch it grow.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Accrue helps you track income, allocate budgets automatically, and see
            your savings build over time with calm, clear insights.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/onboarding">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">View demo</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2 rounded-2xl border border-border/40 px-5 py-5">
            <p className="text-sm font-semibold">Automated allocations</p>
            <p className="text-sm text-muted-foreground">
              Set percentages once and let every income entry split itself.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-border/40 px-5 py-5">
            <p className="text-sm font-semibold">Calm dashboards</p>
            <p className="text-sm text-muted-foreground">
              See progress and totals without noise or clutter.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-border/40 px-5 py-5">
            <p className="text-sm font-semibold">Private by default</p>
            <p className="text-sm text-muted-foreground">
              Toggle balances on and off when you need discretion.
            </p>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border/40 bg-muted/10 px-6 py-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Start in minutes</p>
            <p className="text-sm text-muted-foreground">
              Add your name, budgets, and you are ready to track.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/onboarding">Get started</Link>
          </Button>
        </section>
      </div>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-muted-foreground">
          <p>Accrue. Calm money tracking.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Privacy-first</span>
            <span>Made for daily use</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
