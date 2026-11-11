import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { verifyToken, SESSION_COOKIE } from "../../../lib/auth";
import { getPage, savePage, pageIdFor } from "../../../lib/pages";

function session() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function POST(request) {
  const s = session();
  if (!s) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const title = String(form?.get("title") || "").slice(0, 100);

  if (!file || typeof file.arrayBuffer !== "function" || !file.type?.startsWith("image/")) {
    return NextResponse.json({ error: "An image file is required" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  let output;
  try {
    output = await sharp(input)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Could not process this image" }, { status: 400 });
  }

  const pageId = pageIdFor(s.email);
  const imageId = `${randomUUID().slice(0, 12)}.jpg`;
  await put(`uploads/${pageId}/${imageId}`, output, {
    access: "private",
    addRandomSuffix: false,
    contentType: "image/jpeg"
  });

  const page = (await getPage(pageId)) || {
    pageId,
    name: s.name,
    dp: "",
    bio: "",
    accountType: "personal",
    images: [],
    followers: []
  };
  page.images = page.images || [];
  page.images.unshift({ id: imageId, title, createdAt: new Date().toISOString() });
  await savePage(page);

  return NextResponse.json({ image: page.images[0] });
}

export async function DELETE(request) {
  const s = session();
  if (!s) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  if (!/^[a-z0-9-]+\.jpg$/.test(id)) {
    return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
  }

  const pageId = pageIdFor(s.email);
  const page = await getPage(pageId);
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  page.images = (page.images || []).filter((img) => img.id !== id);
  await savePage(page);
  try {
    await del(`uploads/${pageId}/${id}`);
  } catch {}

  return NextResponse.json({ ok: true });
}
