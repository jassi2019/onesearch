import { NextResponse } from "next/server";
import { aggregateSearch, ALL_SOURCES } from "../../../lib/aggregate";
import { signUrl } from "../../../lib/sign";

const BLOCKED_TERMS = [
  "nude", "nudes", "naked", "porn", "porno", "pornography", "xxx", "nsfw",
  "sex", "sexy", "erotic", "erotica", "hentai", "boobs", "tits", "pussy",
  "dick", "penis", "vagina", "stripper", "topless", "lingerie"
];

function isBlockedQuery(q) {
  const words = q.toLowerCase().split(/[^a-z]+/);
  return BLOCKED_TERMS.some((t) => words.includes(t));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  if (isBlockedQuery(query)) {
    return NextResponse.json(
      { error: "This search isn't allowed. OneSearch only serves safe-for-work content.", blocked: true },
      { status: 422 }
    );
  }

  const sources = (searchParams.get("sources") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => ALL_SOURCES.includes(s));

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(30, Math.max(1, parseInt(searchParams.get("perPage") || "12", 10) || 12));
  const orientation = searchParams.get("orientation") || undefined;
  const color = searchParams.get("color") || undefined;

  try {
    const data = await aggregateSearch({ query, sources, page, perPage, orientation, color });
    const sign = (u) => (u ? `/api/download?u=${encodeURIComponent(u)}&s=${signUrl(u)}` : null);
    data.results = data.results.map((r) => ({
      ...r,
      dl: sign(r.full),
      dls: r.srcs
        ? { low: sign(r.srcs.low), high: sign(r.srcs.high), ultra: sign(r.srcs.ultra) }
        : null
    }));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Search failed", detail: err.message }, { status: 502 });
  }
}
