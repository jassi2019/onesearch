"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ImageGrid from "./ImageGrid";
import { loadEmojiList, appleUrl } from "./EmojiStudio";

const SOURCES = ["openverse", "unsplash", "pexels", "pixabay", "pinterest"];
const TRENDING = ["nature", "business", "food", "travel", "technology", "fashion", "abstract"];
const SKELETON_HEIGHTS = [240, 320, 190, 280, 350, 210, 260, 300, 220, 340, 200, 270];

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 18v4" />
    </svg>
  );
}
const ORIENTATIONS = ["any", "landscape", "portrait", "square"];
const COLORS = ["any", "red", "orange", "yellow", "green", "blue", "black", "white", "gray"];

export default function SearchApp() {
  const [query, setQuery] = useState("");
  const activeSources = SOURCES;
  const [orientation, setOrientation] = useState("any");
  const [color, setColor] = useState("any");
  const [quality, setQuality] = useState("high");
  const [sort, setSort] = useState("relevance");
  const [imgType, setImgType] = useState("all");
  const [license, setLicense] = useState("all");
  const [images, setImages] = useState([]);
  const [sourceStats, setSourceStats] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingNew, setLoadingNew] = useState(false);
  const [searched, setSearched] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [blockedMsg, setBlockedMsg] = useState("");
  const [emojiMatches, setEmojiMatches] = useState([]);
  const [copiedEmoji, setCopiedEmoji] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
  }, []);

  const runSearch = useCallback(
    async (nextPage = 1, overrideQuery, overrides = {}) => {
      const q = (overrideQuery ?? query).trim();
      if (!q || !activeSources.length) return;
      const ori = overrides.orientation ?? orientation;
      const col = overrides.color ?? color;
      const srt = overrides.sort ?? sort;
      const typ = overrides.imgType ?? imgType;
      const lic = overrides.license ?? license;
      setLoading(true);
      if (nextPage === 1) setLoadingNew(true);
      try {
        const params = new URLSearchParams({
          q,
          page: String(nextPage),
          sources: activeSources.join(",")
        });
        if (ori !== "any") params.set("orientation", ori);
        if (col !== "any") params.set("color", col);
        if (srt === "latest") params.set("sort", "latest");
        if (typ !== "all") params.set("type", typ);
        if (lic !== "all") params.set("license", lic);

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        if (res.status === 422 && data.blocked) {
          setImages([]);
          setSuggestions([]);
          setSearched(true);
          setBlockedMsg(data.error);
          return;
        }
        if (!res.ok) throw new Error(data.error || "Search failed");
        setBlockedMsg("");

        setImages((prev) => {
          if (nextPage === 1) return data.results;
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...data.results.filter((r) => !seen.has(r.id))];
        });
        setSourceStats(data.sources || []);
        setPage(nextPage);
        setSearched(true);

        if (nextPage === 1) {
          fetch(`/api/suggest?q=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then((d) => setSuggestions(d.suggestions || []))
            .catch(() => setSuggestions([]));

          loadEmojiList()
            .then((list) => {
              const ql = q.toLowerCase();
              const tokens = ql.split(/\s+/).filter((w) => w.length > 2);
              const scored = [];
              for (const e of list) {
                const n = e.name.toLowerCase();
                if (n === ql || n.includes(ql)) scored.push([0, e]);
                else if (tokens.some((w) => n.includes(w))) scored.push([1, e]);
              }
              scored.sort((a, b) => a[0] - b[0]);
              setEmojiMatches(scored.slice(0, 14).map(([, e]) => e));
            })
            .catch(() => setEmojiMatches([]));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingNew(false);
      }
    },
    [query, orientation, color, sort, imgType, license]
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
            {listening ? <span className="rec-dot" /> : <MicIcon />}
          </button>
        )}
        <button type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : "Search"}
        </button>
      </form>

      <div className="filters">
        <select
          value={orientation}
          onChange={(e) => {
            const v = e.target.value;
            setOrientation(v);
            if (searched) runSearch(1, undefined, { orientation: v });
          }}
        >
          {ORIENTATIONS.map((o) => (
            <option key={o} value={o}>
              {o === "any" ? "Any orientation" : o}
            </option>
          ))}
        </select>
        <select
          value={color}
          onChange={(e) => {
            const v = e.target.value;
            setColor(v);
            if (searched) runSearch(1, undefined, { color: v });
          }}
        >
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c === "any" ? "Any color" : c}
            </option>
          ))}
        </select>
        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option value="low">Low quality</option>
          <option value="high">High quality</option>
          <option value="ultra">Ultra quality</option>
        </select>
        <select
          value={sort}
          onChange={(e) => {
            const v = e.target.value;
            setSort(v);
            if (searched) runSearch(1, undefined, { sort: v });
          }}
        >
          <option value="relevance">Most relevant</option>
          <option value="latest">Newest first</option>
        </select>
        <select
          value={imgType}
          onChange={(e) => {
            const v = e.target.value;
            setImgType(v);
            if (searched) runSearch(1, undefined, { imgType: v });
          }}
        >
          <option value="all">All types</option>
          <option value="photo">Photos</option>
          <option value="illustration">Illustrations</option>
          <option value="vector">Vectors</option>
        </select>
        <select
          value={license}
          onChange={(e) => {
            const v = e.target.value;
            setLicense(v);
            if (searched) runSearch(1, undefined, { license: v });
          }}
        >
          <option value="all">All free images</option>
          <option value="commercial">Commercial use ✓</option>
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

      {searched && emojiMatches.length > 0 && (
        <div className="suggestions">
          <span>Emojis:</span>
          {emojiMatches.map((m) => (
            <button
              key={m.emoji}
              className="emoji-chip"
              title={`${m.name} — click to copy`}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(m.emoji);
                  setCopiedEmoji(m.emoji);
                  setTimeout(() => setCopiedEmoji(""), 1200);
                } catch {}
              }}
            >
              {copiedEmoji === m.emoji ? (
                "✓"
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={appleUrl(m.emoji)}
                  alt={m.emoji}
                  width={26}
                  height={26}
                  draggable={false}
                  onError={(ev) => ev.currentTarget.replaceWith(document.createTextNode(m.emoji))}
                />
              )}
            </button>
          ))}
          <a className="chip" href="/emoji" title="Open Emoji Studio">
            More →
          </a>
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
        <p className="empty">{blockedMsg || "No results. Try another search."}</p>
      )}

      {loadingNew && (
        <div className="search-loader">
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
          <p>Finding the best images…</p>
        </div>
      )}

      {loadingNew ? (
        <div className="grid">
          {SKELETON_HEIGHTS.map((h, i) => (
            <div
              className="skel-card"
              key={i}
              style={{ height: h, animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>
      ) : (
        <ImageGrid images={images} quality={quality} />
      )}

      {images.length > 0 && !loadingNew && (
        <button className="load-more" onClick={() => runSearch(page + 1)} disabled={loading}>
          {loading ? <span className="spinner dark" /> : "Load more"}
        </button>
      )}
    </>
  );
}
