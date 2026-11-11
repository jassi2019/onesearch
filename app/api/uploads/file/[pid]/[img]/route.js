import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "../../../../../../lib/auth";
import { blobFetch } from "../../../../../../lib/pages";

export async function GET(request, { params }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Not logged in", { status: 401 });
  }

  const { pid, img } = params;
  if (!/^[a-f0-9]{16}$/.test(pid) || !/^[a-z0-9-]+\.jpg$/.test(img)) {
    return new Response("Bad request", { status: 400 });
  }

  try {
    const res = await blobFetch(`uploads/${pid}/${img}`);
    if (!res) return new Response("Not found", { status: 404 });
    return new Response(res.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
