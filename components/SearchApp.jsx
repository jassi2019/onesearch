"use client";

import { useState, useCallback } from "react";
import ImageGrid from "./ImageGrid";

const SOURCES = ["unsplash", "pexels", "pixabay"];
const ORIENTATIONS = ["any", "landscape", "portrait", "square"];
const COLORS = ["any", "red", "orange", "yellow", "green", "blue", "black", "white", "gray"];

export default function SearchApp() {
  const [query, setQuery] = useState("");
  const [activeSources, setActiveSources] = useState(SOURCES);
  const [orientation, setOrientation] = useState("any");
  const [color, setColor] = useState("any");
  const [images, setImages] = useState([]);
  const [sourceStats, setSourceStats] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const toggleSource = (s) => {
    setActiveSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const runSearch = useCallback(
    async (nextPage = 1) => {
      const q = query.trim();
      if (!q || !activeSources.length) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q,
          page: String(nextPage),
          sources: activeSources.join(",")
        });
        if (orientation !== "any") params.set("orientation", orientation);
        if (color !== "any") params.set("color", color);

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search failed");

        setImages((prev) => (nextPage === 1 ? data.results : [...prev, ...data.results]));
        setSourceStats(data.sources || []);
        setPage(nextPage);
        setSearched(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [query, activeSources, orientation, color]
  );

  const disabledSources = sourceStats.filter((s) => !s.enabled).map((s) => s.name);

  return (
    <>
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(1);
        }}
      >
        <input
          type="text"
          placeholder="Search images… e.g. cozy workspace, mountain sunset"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "…" : "Search"}
        </button>
      </form>

      <div className="filters">
        {SOURCES.map((s) => (
          <span
            key={s}
            className={`chip ${activeSources.includes(s) ? "active" : ""}`}
            onClick={() => toggleSource(s)}
          >
            {s}
          </span>
        ))}
        <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
          {ORIENTATIONS.map((o) => (
            <option key={o} value={o}>
              {o === "any" ? "Any orientation" : o}
            </option>
          ))}
        </select>
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c === "any" ? "Any color" : c}
            </option>
          ))}
        </select>
      </div>

      {searched && (
        <p className="status">
          {sourceStats
            .filter((s) => s.enabled)
            .map((s) => `${s.name}: ${s.total ?? s.count}`)
            .join(" · ") || "No sources returned results"}
          {disabledSources.length > 0 && (
            <>
              {" "}
              <span className="warn">
                (no API key for: {disabledSources.join(", ")} — see .env.example)
              </span>
            </>
          )}
        </p>
      )}

      {searched && !loading && images.length === 0 && (
        <p className="empty">No results. Try another query or enable more sources.</p>
      )}

      <ImageGrid images={images} />

      {images.length > 0 && (
        <button className="load-more" onClick={() => runSearch(page + 1)} disabled={loading}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
}
