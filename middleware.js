import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/privacy", "/contact", "/pricing", "/trends", "/robots.txt", "/sitemap.xml"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get("os_session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|og.png|icons/).*)"
  ]
};
