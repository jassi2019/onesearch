import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "../../../lib/auth";
import { getPageIndex } from "../../../lib/pages";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const pages = await getPageIndex();
  return NextResponse.json({ pages });
}
