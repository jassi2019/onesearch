import sharp from "sharp";
import { verifyUrl } from "../../../lib/sign";

const SIZE_PRESETS = {
  ig: [1080, 1080],
  story: [1080, 1920],
  yt: [1280, 720]
};

// Only URLs signed by our own /api/search responses can be proxied,
// which prevents this endpoint being used as an open proxy / SSRF vector.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const u = searchParams.get("u") || "";
  const s = searchParams.get("s") || "";

  if (!u || !verifyUrl(u, s)) {
    return new Response("Invalid or unsigned download link", { status: 403 });
  }

  let target;
  try {
    target = new URL(u);
  } catch {
    return new Response("Bad URL", { status: 400 });
  }
  if (target.protocol !== "https:") {
    return new Response("Only https sources allowed", { status: 400 });
  }

  const upstream = await fetch(target, {
    headers: { "User-Agent": "OneSearch/0.1 (image download)" }
  });
  if (!upstream.ok) {
    return new Response("Source fetch failed", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return new Response("Not an image", { status: 415 });
  }

  const id = crypto.randomUUID().slice(0, 8);
  const preset = SIZE_PRESETS[searchParams.get("size")];

  if (preset) {
    const buf = Buffer.from(await upstream.arrayBuffer());
    const isPng = contentType.includes("png");
    const pipeline = sharp(buf).resize(preset[0], preset[1], { fit: "cover", position: "attention" });
    const out = isPng
      ? await pipeline.png().toBuffer()
      : await pipeline.jpeg({ quality: 90 }).toBuffer();
    const ext = isPng ? "png" : "jpg";
    return new Response(out, {
      headers: {
        "Content-Type": isPng ? "image/png" : "image/jpeg",
        "Content-Disposition": `attachment; filename="onesearch-${preset[0]}x${preset[1]}-${id}.${ext}"`,
        "Cache-Control": "private, max-age=0"
      }
    });
  }

  const ext = (contentType.split("/")[1] || "jpg").split(";")[0].replace("jpeg", "jpg");

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="onesearch-${id}.${ext}"`,
      "Cache-Control": "private, max-age=0"
    }
  });
}
