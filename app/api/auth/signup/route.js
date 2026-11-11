import { NextResponse } from "next/server";
import {
  getUser,
  saveUser,
  hashPassword,
  signToken,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../../../lib/auth";
import { ensurePage } from "../../../../lib/pages";

export async function POST(request) {
  const { name, email, password } = await request.json().catch(() => ({}));

  if (!name?.trim() || !email?.includes("@") || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Valid name, email and a password of 6+ characters are required" },
      { status: 400 }
    );
  }

  const existing = await getUser(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    pass: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  await saveUser(email, user);
  await ensurePage(user);

  const res = NextResponse.json({ user: { name: user.name, email: user.email } });
  res.cookies.set(SESSION_COOKIE, signToken({ email: user.email, name: user.name }), sessionCookieOptions());
  return res;
}
