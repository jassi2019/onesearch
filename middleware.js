import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/privacy", "/contact", "/pricing", "/trends", "/robots.txt", "/sitemap.xml"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname === "/images" ||
    pathname.startsWith("/images/") ||
    PUBLIC_PATHS.includes(pathname)
  ) {
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
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|og.png|google1579bf153769366c.html|a81087b82ff2d8edc05fdedcf8c036fb.txt|icons/).*)"
  ]
};
