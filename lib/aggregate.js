import { searchUnsplash } from "./providers/unsplash";
import { searchPexels } from "./providers/pexels";
import { searchPixabay } from "./providers/pixabay";

const PROVIDERS = {
  unsplash: searchUnsplash,
  pexels: searchPexels,
  pixabay: searchPixabay
};

export const ALL_SOURCES = Object.keys(PROVIDERS);

export async function aggregateSearch({ query, sources, page, perPage, orientation, color }) {
  const active = (sources && sources.length ? sources : ALL_SOURCES).filter((s) => PROVIDERS[s]);

  const settled = await Promise.allSettled(
    active.map((s) => PROVIDERS[s]({ query, page, perPage, orientation, color }))
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

  // Interleave results so no single source dominates the top of the grid
  const lists = active.map((s) => bySource[s].results);
  const merged = [];
  const maxLen = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < maxLen; i++) {
    for (const list of lists) {
      if (list[i]) merged.push(list[i]);
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
