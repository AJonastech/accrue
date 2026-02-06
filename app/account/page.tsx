"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";

import { DashboardShell } from "@/components/app/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Account
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Account settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and account actions.
          </p>
        </header>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Image
              src="/profile.jpg"
              alt="User avatar"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full border border-border/60 object-cover"
            />
            <div>
              <CardTitle className="text-base">Agu Jonas</CardTitle>
              <p className="text-sm text-muted-foreground">
                agu.jonas@example.com
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-name">Full name</Label>
              <Input id="account-name" placeholder="Agu Jonas Onyinyechi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-email">Email</Label>
              <Input
                id="account-email"
                type="email"
                placeholder="agu.jonas@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-timezone">Timezone</Label>
              <Input id="account-timezone" placeholder="GMT+1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-language">Language</Label>
              <Input id="account-language" placeholder="English" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign out on this device or delete your account permanently.
            </p>
            <Separator />
            <div className="flex flex-col gap-3 md:flex-row md:justify-end">
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
              >
                Sign out
              </Button>
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                Delete account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
