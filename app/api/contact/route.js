import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const TOPICS = new Set(["support", "partnership", "feedback"]);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { topic, name, email, message, company } = body || {};

  // Honeypot: real users never fill this field. Pretend success for bots.
  if (company) return NextResponse.json({ ok: true });

  if (!TOPICS.has(topic)) {
    return NextResponse.json({ error: "Pick a valid topic." }, { status: 400 });
  }
  const cleanName = String(name || "").trim().slice(0, 80);
  const cleanEmail = String(email || "").trim().slice(0, 120);
  const cleanMessage = String(message || "").trim().slice(0, 2000);

  if (!cleanName || cleanName.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (cleanMessage.length < 10) {
    return NextResponse.json({ error: "Message is too short." }, { status: 400 });
  }

  const record = {
    topic,
    name: cleanName,
    email: cleanEmail,
    message: cleanMessage,
    at: new Date().toISOString(),
    ua: request.headers.get("user-agent") || ""
  };

  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  await put(`contact/${id}.json`, JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 0
  });

  return NextResponse.json({ ok: true });
}
