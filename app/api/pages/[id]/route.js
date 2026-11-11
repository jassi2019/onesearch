import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "../../../../lib/auth";
import { getPage, pageIdFor } from "../../../../lib/pages";

export async function GET(request, { params }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const page = await getPage(params.id);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const myId = pageIdFor(session.email);
  return NextResponse.json({
    page: {
      pageId: page.pageId,
      name: page.name,
      dp: page.dp,
      bio: page.bio,
      accountType: page.accountType,
      images: page.images || [],
      followerCount: (page.followers || []).length
    },
    isOwner: myId === page.pageId,
    isFollowing: (page.followers || []).includes(myId)
  });
}
