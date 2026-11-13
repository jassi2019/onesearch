import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUser,
  saveUser,
  verifyToken,
  signToken,
  SESSION_COOKIE,
  sessionCookieOptions
} from "../../../lib/auth";
import { ensurePage, pageIdFor } from "../../../lib/pages";

const GENDERS = ["male", "female", "other", "prefer_not_to_say"];
const ACCOUNT_TYPES = ["personal", "business"];

function session() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

const publicProfile = (u) => ({
  name: u.name,
  email: u.email,
  gender: u.gender || "",
  bio: u.bio || "",
  dp: u.dp || "",
  accountType: u.accountType || "personal",
  pageId: pageIdFor(u.email),
  google: Boolean(u.google),
  createdAt: u.createdAt
});

export async function GET() {
  const s = session();
  if (!s) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const user = await getUser(s.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ profile: publicProfile(user) });
}

export async function PUT(request) {
  const s = session();
  if (!s) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const user = await getUser(s.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name || name.length > 60) {
      return NextResponse.json({ error: "Name must be 1-60 characters" }, { status: 400 });
    }
    user.name = name;
  }

  if (body.gender !== undefined) {
    if (body.gender !== "" && !GENDERS.includes(body.gender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
    }
    user.gender = body.gender;
  }

  if (body.bio !== undefined) {
    user.bio = String(body.bio).slice(0, 300);
  }

  if (body.dp !== undefined) {
    const dp = String(body.dp);
    if (dp && (!dp.startsWith("data:image/") || dp.length > 400_000)) {
      return NextResponse.json({ error: "Profile photo must be an image under ~300KB" }, { status: 400 });
    }
    user.dp = dp;
  }

  if (body.accountType !== undefined) {
    if (!ACCOUNT_TYPES.includes(body.accountType)) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }
    const current = user.accountType || "personal";
    if (body.accountType === "business" && current !== "business") {
      if (body.creatorConsent !== true) {
        return NextResponse.json(
          { error: "Please accept the Creator Terms to switch to a Business account" },
          { status: 400 }
        );
      }
      user.creatorConsentAt = new Date().toISOString();
    }
    user.accountType = body.accountType;
  }

  await saveUser(user.email, user);
  await ensurePage(user);

  const res = NextResponse.json({ profile: publicProfile(user) });
  res.cookies.set(
    SESSION_COOKIE,
    signToken({ email: user.email, name: user.name }),
    sessionCookieOptions()
  );
  return res;
}
