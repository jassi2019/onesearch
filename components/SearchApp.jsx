"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ImageGrid from "./ImageGrid";

const SOURCES = ["openverse", "unsplash", "pexels", "pixabay", "pinterest"];
const TRENDING = ["nature", "business", "food", "travel", "technology", "fashion", "abstract"];
const ORIENTATIONS = ["any", "landscape", "portrait", "square"];
const COLORS = ["any", "red", "orange", "yellow", "green", "blue", "black", "white", "gray"];

export default function SearchApp() {
  const [query, setQuery] = useState("");
  const activeSources = SOURCES;
  const [orientation, setOrientation] = useState("any");
  const [color, setColor] = useState("any");
  const [images, setImages] = useState([]);
  const [sourceStats, setSourceStats] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
  }, []);

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

        if (nextPage === 1) {
          fetch(`/api/suggest?q=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then((d) => setSuggestions(d.suggestions || []))
            .catch(() => setSuggestions([]));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [query, orientation, color]
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

      {!searched && (
        <div className="suggestions">
          <span>Trending:</span>
          {TRENDING.map((t) => (
            <span
              key={t}
              className="chip"
              onClick={() => {
                setQuery(t);
                runSearch(1, t);
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <span>Related:</span>
          {suggestions.map((s) => (
            <span
              key={s}
              className="chip"
              onClick={() => {
                setQuery(s);
                runSearch(1, s);
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {searched && (
        <p className="status">
          {(() => {
            const total = sourceStats
              .filter((s) => s.enabled)
              .reduce((sum, s) => sum + (s.total ?? s.count ?? 0), 0);
            return total > 0 ? `${total.toLocaleString()} results found` : "";
          })()}
        </p>
      )}

      {searched && !loading && images.length === 0 && (
        <p className="empty">No results. Try another search.</p>
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
