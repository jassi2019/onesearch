import { NextResponse } from "next/server";
import { signToken } from "../../../../../lib/auth";

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = new URL(request.url).origin;

  if (!clientId) {
    return NextResponse.redirect(`${origin}/login?error=google-not-configured`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state: signToken({ csrf: true }, 600),
    prompt: "select_account"
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
