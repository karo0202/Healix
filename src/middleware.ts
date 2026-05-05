import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const response = intlMiddleware(request);

  if (pathname.includes("/patient") || pathname.includes("/doctor") || pathname.includes("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return NextResponse.redirect(new URL("/en/auth/login", request.url));
    }
    if (pathname.includes("/patient") && token.role !== "PATIENT") {
      return NextResponse.redirect(new URL("/en/unauthorized", request.url));
    }
    if (pathname.includes("/doctor") && token.role !== "DOCTOR") {
      return NextResponse.redirect(new URL("/en/unauthorized", request.url));
    }
    if (pathname.includes("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/en/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
