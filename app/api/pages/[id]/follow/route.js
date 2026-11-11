import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "../../../../../lib/auth";
import { getPage, savePage, pageIdFor } from "../../../../../lib/pages";

export async function POST(request, { params }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const myId = pageIdFor(session.email);
  if (myId === params.id) {
    return NextResponse.json({ error: "You cannot follow your own page" }, { status: 400 });
  }

  const page = await getPage(params.id);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  page.followers = page.followers || [];
  const i = page.followers.indexOf(myId);
  const following = i === -1;
  if (following) page.followers.push(myId);
  else page.followers.splice(i, 1);

  await savePage(page);
  return NextResponse.json({ isFollowing: following, followerCount: page.followers.length });
}
