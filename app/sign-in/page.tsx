"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/onboarding");
    }
  }, [router, status]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 pb-16 pt-24 text-center">
        <Image
          src="/accrue-logo.svg"
          alt="Accrue logo"
          width={48}
          height={48}
          className="rounded-2xl"
        />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Sign in to Accrue
          </h1>
          <p className="text-sm text-muted-foreground">
            Use Google to continue. No passwords to remember.
          </p>
        </div>
        <Button size="lg" onClick={() => signIn("google")}>Sign in with Google</Button>
      </div>
    </main>
  );
}
