import { NextResponse } from "next/server";

async function suggestWithClaude(query) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-haiku-5-5",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Give 4 short, diverse image-search queries closely related to: "${query}". Reply with ONLY a JSON array of strings, same language as the input.`
        }
      ]
    })
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text || "[]";
  const match = text.match(/\[[\s\S]*\]/);
  const arr = JSON.parse(match ? match[0] : "[]");
  return arr.filter((s) => typeof s === "string").slice(0, 4);
}

async function suggestWithDatamuse(query) {
  const res = await fetch(
    `https://api.datamuse.com/words?ml=${encodeURIComponent(query)}&max=8`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error(`Datamuse ${res.status}`);
  const words = await res.json();
  return words
    .map((w) => w.word)
    .filter((w) => w && w.length > 2 && w.toLowerCase() !== query.toLowerCase())
    .slice(0, 4);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();
  if (!query) return NextResponse.json({ suggestions: [] });

  try {
    const suggestions = process.env.ANTHROPIC_API_KEY
      ? await suggestWithClaude(query)
      : await suggestWithDatamuse(query);
    return NextResponse.json({ suggestions, ai: Boolean(process.env.ANTHROPIC_API_KEY) });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
