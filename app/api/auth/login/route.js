import { NextResponse } from "next/server";
import {
  getUser,
  verifyPassword,
  signToken,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../../../lib/auth";

export async function POST(request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await getUser(email);
  if (!user || !verifyPassword(password, user.pass)) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  const res = NextResponse.json({ user: { name: user.name, email: user.email } });
  res.cookies.set(SESSION_COOKIE, signToken({ email: user.email, name: user.name }), sessionCookieOptions());
  return res;
}
