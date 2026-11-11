import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "../../../lib/auth";
import { pageIdFor } from "../../../lib/pages";
import { getNotifications, markAllRead } from "../../../lib/notifications";

function session() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function GET() {
  const s = session();
  if (!s) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const notifications = await getNotifications(pageIdFor(s.email));
  return NextResponse.json({
    notifications,
    unread: notifications.filter((n) => !n.read).length
  });
}

export async function POST() {
  const s = session();
  if (!s) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  await markAllRead(pageIdFor(s.email));
  return NextResponse.json({ ok: true });
}
