"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ImageGrid from "./ImageGrid";

const SOURCES = ["openverse", "unsplash", "pexels", "pixabay", "pinterest"];
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
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
  }, []);

  const toggleSource = (s) => {
    setActiveSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const runSearch = useCallback(
    async (nextPage = 1, overrideQuery) => {
      const q = (overrideQuery ?? query).trim();
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

  const startVoiceSearch = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      runSearch(1, transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    rec.start();
  }, [runSearch]);

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
        {voiceSupported && (
          <button
            type="button"
            className={`mic ${listening ? "listening" : ""}`}
            onClick={startVoiceSearch}
            title={listening ? "Listening… tap to stop" : "Search by voice"}
            aria-label="Search by voice"
          >
            {listening ? "●" : "🎤"}
          </button>
        )}
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
