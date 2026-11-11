import { verifyUrl } from "../../../lib/sign";

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

  const ext = (contentType.split("/")[1] || "jpg").split(";")[0].replace("jpeg", "jpg");
  const filename = `onesearch-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=0"
    }
  });
}
