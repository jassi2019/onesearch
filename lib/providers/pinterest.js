// Pinterest API v5 — requires an OAuth access token from a Pinterest app
// (https://developers.pinterest.com). There is no keyless/public search endpoint.
export async function searchPinterest({ query, page = 1, perPage = 12 }) {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) return { source: "pinterest", enabled: false, results: [] };

  const params = new URLSearchParams({ query, page_size: String(perPage) });

  const res = await fetch(`https://api.pinterest.com/v5/search/pins?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }
  });
  if (!res.ok) throw new Error(`Pinterest ${res.status}`);
  const data = await res.json();

  return {
    source: "pinterest",
    enabled: true,
    total: null,
    results: (data.items || [])
      .map((p) => {
        const imgs = p.media?.images || {};
        const sizes = Object.values(imgs);
        const thumb = imgs["600x"]?.url || sizes[0]?.url;
        const full = imgs["1200x"]?.url || imgs.originals?.url || thumb;
        if (!thumb) return null;
        return {
          id: `pinterest-${p.id}`,
          source: "pinterest",
          thumb,
          full,
          srcs: { low: thumb, high: full, ultra: imgs.originals?.url || full },
          width: imgs["1200x"]?.width || null,
          height: imgs["1200x"]?.height || null,
          alt: p.title || p.description || query,
          photographer: p.board_owner?.username || "Pinterest user",
          photographerUrl: p.board_owner?.username
            ? `https://www.pinterest.com/${p.board_owner.username}/`
            : "",
          pageUrl: `https://www.pinterest.com/pin/${p.id}/`
        };
      })
      .filter(Boolean)
  };
}
