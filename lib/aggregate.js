import { searchUnsplash } from "./providers/unsplash";
import { searchPexels } from "./providers/pexels";
import { searchPixabay } from "./providers/pixabay";
import { searchOpenverse } from "./providers/openverse";
import { searchPinterest } from "./providers/pinterest";

const PROVIDERS = {
  openverse: searchOpenverse,
  unsplash: searchUnsplash,
  pexels: searchPexels,
  pixabay: searchPixabay,
  pinterest: searchPinterest
};

export const ALL_SOURCES = Object.keys(PROVIDERS);

export async function aggregateSearch({ query, sources, page, perPage, orientation, color, sort, type, license }) {
  const active = (sources && sources.length ? sources : ALL_SOURCES).filter((s) => PROVIDERS[s]);

  const settled = await Promise.allSettled(
    active.map((s) => PROVIDERS[s]({ query, page, perPage, orientation, color, sort, type, license }))
  );

  const bySource = {};
  const errors = [];
  settled.forEach((r, i) => {
    const name = active[i];
    if (r.status === "fulfilled") {
      bySource[name] = r.value;
    } else {
      errors.push({ source: name, message: r.reason?.message || "failed" });
      bySource[name] = { source: name, enabled: true, results: [] };
    }
  });

  // Interleave results so no single source dominates the top of the grid,
  // dropping duplicates (same id, or same underlying file across sources)
  const lists = active.map((s) => bySource[s].results);
  const merged = [];
  const seen = new Set();
  const maxLen = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < maxLen; i++) {
    for (const list of lists) {
      const item = list[i];
      if (!item) continue;
      const key = item.full || item.id;
      if (seen.has(item.id) || seen.has(key)) continue;
      seen.add(item.id);
      seen.add(key);
      merged.push(item);
    }
  }

  return {
    query,
    page,
    results: merged,
    sources: active.map((s) => ({
      name: s,
      enabled: bySource[s].enabled,
      count: bySource[s].results.length,
      total: bySource[s].total ?? null
    })),
    errors
  };
}
