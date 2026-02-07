import { DashboardShell } from "@/components/app/dashboard-shell";

export default function NotificationsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            All your alerts and reminders live here.
          </p>
        </header>

        <section className="flex flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10" />
            <div className="absolute inset-2 rounded-full border border-primary/20 bg-background/90" />
            <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-background bg-primary/80" />
            <svg
              viewBox="0 0 24 24"
              className="relative h-9 w-9"
              fill="none"
              stroke="url(#bellGradient)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="bellGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary) / 0.7)"
                  />
                </linearGradient>
              </defs>
              <path d="M10 21h4" />
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold">All clear for now</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll notify you when something needs your attention.
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
