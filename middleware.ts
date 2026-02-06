import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = pathname === "/" || pathname === "/sign-in";
  let token: Awaited<ReturnType<typeof getToken>> | null = null;

  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch {
    token = null;
  }

  if (!token) {
    if (isPublic) return NextResponse.next();
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/sign-in") {
    const redirectUrl = token.onboarded ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (!token.onboarded && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (token.onboarded && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map|txt|xml)).*)",
  ],
};
