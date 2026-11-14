// Marketing trend calendar — recurring dates (month is 1-based).
// Movable festivals carry explicit per-year dates.
const EVENTS = [
  { name: "New Year", emoji: "🎆", month: 1, day: 1, queries: ["new year celebration", "fireworks night", "party confetti", "new beginnings"] },
  { name: "Republic Day (India)", emoji: "🇮🇳", month: 1, day: 26, queries: ["india flag", "india gate delhi", "tricolor abstract"] },
  { name: "Valentine's Day", emoji: "💝", month: 2, day: 14, queries: ["valentines day hearts", "romantic couple", "red roses", "love letter"] },
  { name: "Women's Day", emoji: "💪", month: 3, day: 8, queries: ["women empowerment", "working woman", "women celebration"] },
  { name: "Holi", emoji: "🎨", dates: { 2026: [3, 3], 2027: [3, 22] }, queries: ["holi colors", "color powder festival", "colorful celebration india"] },
  { name: "Eid al-Fitr", emoji: "🌙", dates: { 2026: [3, 20], 2027: [3, 10] }, queries: ["eid mubarak", "crescent moon lanterns", "festive sweets"] },
  { name: "Easter", emoji: "🐣", dates: { 2026: [4, 5], 2027: [3, 28] }, queries: ["easter eggs", "spring flowers", "pastel background"] },
  { name: "Earth Day", emoji: "🌍", month: 4, day: 22, queries: ["planet earth", "green nature", "sustainability", "eco friendly"] },
  { name: "Mother's Day", emoji: "🌸", dates: { 2026: [5, 10], 2027: [5, 9] }, queries: ["mother and child", "mothers day flowers", "family love"] },
  { name: "Father's Day", emoji: "👔", dates: { 2026: [6, 21], 2027: [6, 20] }, queries: ["father and kids", "dad hero", "family moments"] },
  { name: "Yoga Day", emoji: "🧘", month: 6, day: 21, queries: ["yoga sunrise", "meditation calm", "fitness wellness"] },
  { name: "Independence Day (India)", emoji: "🇮🇳", month: 8, day: 15, queries: ["india independence", "indian flag sky", "freedom celebration india"] },
  { name: "Raksha Bandhan", emoji: "🪢", dates: { 2026: [8, 28], 2027: [8, 17] }, queries: ["rakhi festival", "brother sister", "indian festival thali"] },
  { name: "Teachers' Day", emoji: "📚", month: 9, day: 5, queries: ["teacher classroom", "books education", "mentor student"] },
  { name: "Gandhi Jayanti", emoji: "🕊️", month: 10, day: 2, queries: ["peace dove", "charkha spinning wheel", "nonviolence"] },
  { name: "Navratri", emoji: "💃", dates: { 2026: [10, 11], 2027: [9, 30] }, queries: ["navratri garba", "dandiya dance", "festive india colors"] },
  { name: "Dussehra", emoji: "🏹", dates: { 2026: [10, 20], 2027: [10, 9] }, queries: ["dussehra festival", "ravan effigy", "victory of good"] },
  { name: "Halloween", emoji: "🎃", month: 10, day: 31, queries: ["halloween pumpkin", "spooky night", "autumn dark forest"] },
  { name: "Diwali", emoji: "🪔", dates: { 2026: [11, 8], 2027: [10, 29] }, queries: ["diwali diya lamps", "rangoli design", "festive lights india", "diwali sale banner"] },
  { name: "Singles' Day Sale", emoji: "🛍️", month: 11, day: 11, queries: ["shopping sale", "online shopping", "discount banner"] },
  { name: "Children's Day (India)", emoji: "🧒", month: 11, day: 14, queries: ["happy children playing", "kids balloons", "school children india"] },
  { name: "Black Friday", emoji: "🏷️", dates: { 2026: [11, 27], 2027: [11, 26] }, queries: ["black friday sale", "mega discount", "shopping bags dark"] },
  { name: "Cyber Monday", emoji: "💻", dates: { 2026: [11, 30], 2027: [11, 29] }, queries: ["online deals", "laptop shopping", "tech sale"] },
  { name: "Christmas", emoji: "🎄", month: 12, day: 25, queries: ["christmas tree lights", "santa gifts", "winter cozy", "christmas sale banner"] },
  { name: "New Year's Eve", emoji: "🥂", month: 12, day: 31, queries: ["new year party", "champagne toast", "countdown celebration"] }
];

export const EVERGREEN = [
  "minimal workspace", "business meeting", "social media marketing", "food photography",
  "mountain landscape", "city night", "abstract gradient", "team collaboration",
  "fitness lifestyle", "coffee aesthetic", "technology ai", "fashion portrait"
];

function dateFor(ev, year) {
  if (ev.dates) {
    const d = ev.dates[year];
    return d ? new Date(year, d[0] - 1, d[1]) : null;
  }
  return new Date(year, ev.month - 1, ev.day);
}

// Events in the next `days` days (default 90), soonest first.
export function upcomingEvents(days = 90, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const horizon = new Date(today.getTime() + days * 86400000);
  const out = [];
  for (const ev of EVENTS) {
    for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
      const d = dateFor(ev, year);
      if (d && d >= today && d <= horizon) {
        out.push({
          ...ev,
          date: d,
          daysLeft: Math.round((d - today) / 86400000)
        });
        break;
      }
    }
  }
  return out.sort((a, b) => a.date - b.date);
}
