import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { verifyToken, SESSION_COOKIE } from "../../../lib/auth";
import { getPage, savePage, pageIdFor } from "../../../lib/pages";
import { addNotification } from "../../../lib/notifications";

function session() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

// Best-effort AI-image detection: generators commonly embed their name or the
// generation prompt in EXIF/XMP/PNG-text metadata.
const AI_MARKERS = [
  "stable diffusion", "stable-diffusion", "sdxl", "sd-webui", "automatic1111",
  "comfyui", "invokeai", "novelai", "midjourney", "dall-e", "dall·e", "dalle",
  "adobe firefly", "firefly image", "leonardo.ai", "ideogram", "flux.1",
  "c2pa.ai", "trainedalgorithmicmedia", "\"prompt\":", "negative prompt:",
  // AI-edited / partially generated (C2PA composite marker, generative fill)
  "compositewithtrainedalgorithmicmedia", "generative fill", "generativefill",
  "stability.ai", "stabilityai", "dreamstudio", "runwayml", "krea.ai",
  "recraft.ai", "gpt-image", "bing image creator"
];

function looksAiGenerated(buffer) {
  const sample = buffer.subarray(0, 256 * 1024).toString("latin1").toLowerCase();
  return AI_MARKERS.some((m) => sample.includes(m));
}

// Pixel-level AI detection via Sightengine (catches cropped/metadata-stripped
// AI images). Runs only when API keys are configured; free tier: 500/month.
async function sightengineAiScore(buffer) {
  const user = process.env.SIGHTENGINE_API_USER;
  const secret = process.env.SIGHTENGINE_API_SECRET;
  if (!user || !secret) return null;
  try {
    const form = new FormData();
    form.append("media", new Blob([buffer], { type: "image/jpeg" }), "upload.jpg");
    form.append("models", "genai");
    form.append("api_user", user);
    form.append("api_secret", secret);
    const res = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.type?.ai_generated ?? null;
  } catch {
    return null;
  }
}

const xmlEscape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function watermarkSvg(width, height, text) {
  const safe = xmlEscape(text);
  const corner = Math.max(14, Math.round(width / 42));
  const center = Math.max(26, Math.round(width / 14));
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${center}" font-weight="bold"
        fill="rgba(255,255,255,0.16)" text-anchor="middle"
        transform="rotate(-28 ${width / 2} ${height / 2})">${safe}</text>
      <text x="${width - 12}" y="${height - 12}" font-family="Arial, sans-serif" font-size="${corner}"
        font-weight="bold" fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.4)" stroke-width="1"
        text-anchor="end">${safe}</text>
    </svg>`
  );
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

  if (looksAiGenerated(input)) {
    return NextResponse.json(
      { error: "AI-generated or AI-edited images are not allowed on creator pages" },
      { status: 422 }
    );
  }

  const aiScore = await sightengineAiScore(input);
  if (aiScore !== null && aiScore >= 0.5) {
    return NextResponse.json(
      { error: "Our AI detector flagged this as an AI-generated image — only original photos are allowed" },
      { status: 422 }
    );
  }

  let output;
  try {
    const resized = await sharp(input)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toBuffer();
    const meta = await sharp(resized).metadata();
    const label = `© ${s.name} • OneSearch`;
    output = await sharp(resized)
      .composite([{ input: watermarkSvg(meta.width, meta.height, label) }])
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

  for (const follower of (page.followers || []).slice(0, 20)) {
    await addNotification(follower, {
      type: "upload",
      text: `${page.name} uploaded a new image`,
      fromPageId: pageId
    }).catch(() => {});
  }

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
