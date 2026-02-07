"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { Bell } from "lucide-react";

import { Sidebar } from "@/components/app/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  className?: string;
};

type ProfileData = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

let cachedProfile: ProfileData | null = null;
let cachedAt = 0;
const PROFILE_CACHE_TTL = 5 * 60 * 1000;

export function DashboardShell({ children, className }: DashboardShellProps) {
  const [profile, setProfile] = useState<ProfileData | null>(() => cachedProfile);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const now = Date.now();
        if (cachedProfile && now - cachedAt < PROFILE_CACHE_TTL) {
          setProfile(cachedProfile);
          return;
        }
        const response = await fetch("/api/me");
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        const nextProfile = data.user ?? null;
        cachedProfile = nextProfile;
        cachedAt = Date.now();
        setProfile(nextProfile);
      } catch {
        if (active) setProfile(null);
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        name?: string | null;
        image?: string | null;
      };
      setProfile((prev) => {
        const nextProfile = {
          ...(prev ?? {}),
          ...(detail ?? {}),
        };
        cachedProfile = nextProfile;
        cachedAt = Date.now();
        return nextProfile;
      });
    };
    window.addEventListener("profile:updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile:updated", handleProfileUpdate);
    };
  }, []);

  const avatarSrc = useMemo(() => {
    const image = profile?.image;
    if (!image) return null;
    if (image.startsWith("http") || image.startsWith("data:")) return image;
    const encoded = encodeURIComponent(image).replace(/%2F/g, "/");
    return `/api/images/${encoded}`;
  }, [profile?.image]);

  const displayName = profile?.name ?? "Your account";
  const initials = useMemo(() => {
    const name = profile?.name?.trim();
    if (!name) return "";
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
  }, [profile?.name]);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-6 md:flex-row md:gap-10 md:px-6 md:pb-16 md:pt-10">
        <Sidebar />
        <main className="min-h-screen w-full flex-1 min-w-0">
          <div className="w-full">
            <div className="mb-6 flex items-center justify-between md:hidden">
              <Link href="/settings" className="flex items-center gap-3">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="User avatar"
                    className="h-10 w-10 rounded-full border border-border/60 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground">
                    {initials || "?"}
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Welcome back</p>
                  <p className="text-base font-semibold leading-none">
                    {displayName}
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
                      {displayName}
                    </p>
                    <p className="leading-none">Account</p>
                  </div>
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="User avatar"
                      className="h-9 w-9 rounded-full border border-border/60 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/20 text-[10px] font-semibold text-muted-foreground">
                      {initials || "?"}
                    </div>
                  )}
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
