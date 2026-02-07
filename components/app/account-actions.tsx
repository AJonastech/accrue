"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AccountActions() {
  return (
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
  );
}
