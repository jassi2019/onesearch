import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "../../../../lib/auth";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { name: payload.name, email: payload.email } });
}
