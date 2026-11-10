const ORIENTATION = { landscape: "wide", portrait: "tall", square: "square" };

// Openverse requires no API key (anonymous: ~20 req/min)
export async function searchOpenverse({ query, page = 1, perPage = 12, orientation }) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    page_size: String(perPage)
  });
  if (ORIENTATION[orientation]) params.set("aspect_ratio", ORIENTATION[orientation]);

  const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
    headers: { "User-Agent": "OneSearch/0.1 (image aggregator demo)" },
    next: { revalidate: 300 }
  });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const data = await res.json();

  return {
    source: "openverse",
    enabled: true,
    total: data.result_count,
    results: (data.results || []).map((p) => ({
      id: `openverse-${p.id}`,
      source: "openverse",
      thumb: p.thumbnail || p.url,
      full: p.url,
      width: p.width,
      height: p.height,
      alt: p.title || query,
      photographer: p.creator || "Unknown",
      photographerUrl: p.creator_url || "",
      pageUrl: p.foreign_landing_url || p.url
    }))
  };
}
