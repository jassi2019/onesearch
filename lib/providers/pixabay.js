const ORIENTATION = { landscape: "horizontal", portrait: "vertical" };
const COLOR = {
  red: "red", orange: "orange", yellow: "yellow", green: "green",
  blue: "blue", black: "black", white: "white", gray: "gray"
};

export async function searchPixabay({ query, page = 1, perPage = 12, orientation, color }) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return { source: "pixabay", enabled: false, results: [] };

  const params = new URLSearchParams({
    key,
    q: query,
    page: String(page),
    per_page: String(Math.max(3, perPage)),
    image_type: "photo",
    safesearch: "true"
  });
  if (ORIENTATION[orientation]) params.set("orientation", ORIENTATION[orientation]);
  if (COLOR[color]) params.set("colors", COLOR[color]);

  const res = await fetch(`https://pixabay.com/api/?${params}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Pixabay ${res.status}`);
  const data = await res.json();

  return {
    source: "pixabay",
    enabled: true,
    total: data.totalHits,
    results: (data.hits || []).map((p) => ({
      id: `pixabay-${p.id}`,
      source: "pixabay",
      thumb: p.webformatURL,
      full: p.largeImageURL,
      srcs: {
        low: p.webformatURL,
        high: p.largeImageURL,
        ultra: p.fullHDURL || p.imageURL || p.largeImageURL
      },
      width: p.imageWidth,
      height: p.imageHeight,
      alt: p.tags || query,
      photographer: p.user || "Unknown",
      photographerUrl: p.user_id ? `https://pixabay.com/users/${p.user}-${p.user_id}/` : "",
      pageUrl: p.pageURL || ""
    }))
  };
}
