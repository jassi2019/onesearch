const ORIENTATION = { landscape: "landscape", portrait: "portrait", square: "squarish" };
const COLOR = {
  red: "red", orange: "orange", yellow: "yellow", green: "green",
  blue: "blue", black: "black", white: "white", gray: "black_and_white"
};

export async function searchUnsplash({ query, page = 1, perPage = 12, orientation, color }) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return { source: "unsplash", enabled: false, results: [] };

  const params = new URLSearchParams({ query, page: String(page), per_page: String(perPage) });
  if (ORIENTATION[orientation]) params.set("orientation", ORIENTATION[orientation]);
  if (COLOR[color]) params.set("color", COLOR[color]);

  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${key}` },
    next: { revalidate: 300 }
  });
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  const data = await res.json();

  return {
    source: "unsplash",
    enabled: true,
    total: data.total,
    results: (data.results || []).map((p) => ({
      id: `unsplash-${p.id}`,
      source: "unsplash",
      thumb: p.urls.small,
      full: p.urls.regular,
      width: p.width,
      height: p.height,
      alt: p.alt_description || query,
      photographer: p.user?.name || "Unknown",
      photographerUrl: p.user?.links?.html || "",
      pageUrl: p.links?.html || ""
    }))
  };
}
