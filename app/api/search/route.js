import { NextResponse } from "next/server";
import { aggregateSearch, ALL_SOURCES } from "../../../lib/aggregate";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
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
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Search failed", detail: err.message }, { status: 502 });
  }
}
