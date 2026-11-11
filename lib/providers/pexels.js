const ORIENTATION = { landscape: "landscape", portrait: "portrait", square: "square" };
const COLOR = {
  red: "red", orange: "orange", yellow: "yellow", green: "green",
  blue: "blue", black: "black", white: "white", gray: "gray"
};

export async function searchPexels({ query, page = 1, perPage = 12, orientation, color, type }) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return { source: "pexels", enabled: false, results: [] };
  if (type && type !== "photo") return { source: "pexels", enabled: true, results: [] };

  const params = new URLSearchParams({ query, page: String(page), per_page: String(perPage) });
  if (ORIENTATION[orientation]) params.set("orientation", ORIENTATION[orientation]);
  if (COLOR[color]) params.set("color", COLOR[color]);

  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: key },
    next: { revalidate: 300 }
  });
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const data = await res.json();

  return {
    source: "pexels",
    enabled: true,
    total: data.total_results,
    results: (data.photos || []).map((p) => ({
      id: `pexels-${p.id}`,
      source: "pexels",
      thumb: p.src.medium,
      full: p.src.large2x,
      srcs: { low: p.src.medium, high: p.src.large2x, ultra: p.src.original },
      width: p.width,
      height: p.height,
      alt: p.alt || query,
      photographer: p.photographer || "Unknown",
      photographerUrl: p.photographer_url || "",
      pageUrl: p.url || ""
    }))
  };
}
