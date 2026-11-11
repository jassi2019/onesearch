import { NextResponse } from "next/server";
import {
  getUser,
  saveUser,
  verifyToken,
  signToken,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../../../../lib/auth";

export async function GET(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state || !verifyToken(state)) {
    return NextResponse.redirect(`${origin}/login?error=google-failed`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code"
      })
    });
    if (!tokenRes.ok) throw new Error("token exchange failed");
    const tokens = await tokenRes.json();

    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    if (!infoRes.ok) throw new Error("userinfo failed");
    const info = await infoRes.json();

    if (!info.email) throw new Error("no email");

    let user = await getUser(info.email);
    if (!user) {
      user = {
        name: info.name || info.email.split("@")[0],
        email: info.email.toLowerCase(),
        google: true,
        createdAt: new Date().toISOString()
      };
      await saveUser(info.email, user);
    }

    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.set(
      SESSION_COOKIE,
      signToken({ email: user.email, name: user.name }),
      sessionCookieOptions()
    );
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/login?error=google-failed`);
  }
}
