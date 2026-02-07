import { Bell } from "lucide-react";

import { DashboardShell } from "@/components/app/dashboard-shell";

export default function NotificationsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Notifications
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            You&apos;re all caught up
          </h1>
          <p className="text-sm text-muted-foreground">
            Check back later for updates and reminders.
          </p>
        </header>

        <section className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-muted/10 px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold">You&apos;re up to date!</p>
            <p className="text-sm text-muted-foreground">
              Nothing new right now. We&apos;ll notify you when something
              changes.
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
