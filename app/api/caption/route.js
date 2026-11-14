import { NextResponse } from "next/server";

const PLATFORMS = { instagram: "Instagram", linkedin: "LinkedIn", x: "X (Twitter)" };

function fallbackCaptions(topic, platform) {
  const t = topic.trim();
  if (platform === "linkedin") {
    return [
      `Visual inspiration: ${t}. Sometimes the right image says more than a paragraph ever could.`,
      `Working on something around ${t} — swipe through and tell me what you think.`,
      `${t[0].toUpperCase() + t.slice(1)} — a small visual story for your feed today.`
    ];
  }
  return [
    `${t} vibes ✨ #${t.replace(/\s+/g, "")} #inspiration #daily`,
    `Current mood: ${t} 📸 #${t.replace(/\s+/g, "")} #explore`,
    `A little ${t} for your feed today 💫 #aesthetic #${t.replace(/\s+/g, "")}`
  ];
}

async function captionsWithPollinations(topic, platform) {
  const label = PLATFORMS[platform] || "Instagram";
  const prompt = `Write 3 catchy ${label} captions for a social media post built around an image about "${topic}". Each caption under 220 characters${
    platform === "linkedin" ? ", professional tone, no hashtags needed" : ", include 3-5 relevant hashtags"
  }. Same language as the topic. Reply with ONLY a JSON array of 3 strings.`;
  const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
    signal: AbortSignal.timeout(12000)
  });
  if (!res.ok) throw new Error(`Pollinations ${res.status}`);
  const text = await res.text();
  const match = text.match(/\[[\s\S]*?\]/);
  const arr = JSON.parse(match ? match[0] : "[]");
  const clean = arr.filter((s) => typeof s === "string" && s.length > 5).slice(0, 3);
  if (!clean.length) throw new Error("empty");
  return clean;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topic = (searchParams.get("q") || "").trim().slice(0, 120);
  const platform = searchParams.get("platform") || "instagram";
  if (!topic) return NextResponse.json({ captions: [] });

  try {
    return NextResponse.json({ captions: await captionsWithPollinations(topic, platform), ai: true });
  } catch {
    return NextResponse.json({ captions: fallbackCaptions(topic, platform), ai: false });
  }
}
