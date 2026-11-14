"use client";

import { useEffect, useState } from "react";
import { addToBoard, getBoardNames, toggleFavorite, isFavorite } from "../lib/boards";

const QUALITY_OPTS = [
  { key: "low", label: "Low — fast" },
  { key: "high", label: "High resolution" },
  { key: "ultra", label: "Ultra HD — original" }
];

const DL_PRESETS = [
  { key: "ig", label: "Instagram 1080×1080" },
  { key: "story", label: "Story 1080×1920" },
  { key: "yt", label: "YouTube 1280×720" }
];

const CAPTION_PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X" }
];

export default function Lightbox({ images, index, onClose, onNavigate, quality = "high" }) {
  const img = images[index];
  const [menu, setMenu] = useState(null);
  const [newBoard, setNewBoard] = useState("");
  const [saved, setSaved] = useState(false);
  const [favTick, setFavTick] = useState(0);
  const [hasLogo, setHasLogo] = useState(false);
  const [withLogo, setWithLogo] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [captions, setCaptions] = useState(null); // null | "loading" | string[]
  const [capPlatform, setCapPlatform] = useState("instagram");
  const [copiedCap, setCopiedCap] = useState(-1);

  useEffect(() => {
    setMenu(null);
    setSaved(false);
    setCaptions(null);
    setCopiedCap(-1);
  }, [index]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setHasLogo(Boolean(d?.profile?.brandKit?.logo)))
      .catch(() => {});
    try {
      setCanShareFiles(
        typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [new File([""], "x.jpg", { type: "image/jpeg" })] })
      );
    } catch {}
  }, []);

  const brandParam = withLogo && hasLogo ? "&brand=1" : "";

  const shareToApps = async () => {
    if (!img.dl) return;
    setSharing(true);
    try {
      const res = await fetch(img.dls?.low || img.dl);
      const blob = await res.blob();
      const file = new File([blob], "onesearch-image.jpg", { type: blob.type || "image/jpeg" });
      await navigator.share({ files: [file], title: img.alt || "Image" });
    } catch {}
    setSharing(false);
    setMenu(null);
  };

  const loadCaptions = async (platform) => {
    setCapPlatform(platform);
    setCaptions("loading");
    try {
      const topic = (img.alt || "beautiful image").slice(0, 100);
      const res = await fetch(
        `/api/caption?q=${encodeURIComponent(topic)}&platform=${platform}`
      );
      const d = await res.json();
      setCaptions(d.captions?.length ? d.captions : []);
    } catch {
      setCaptions([]);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNavigate]);

  if (!img) return null;

  const save = (board) => {
    const name = board.trim();
    if (!name) return;
    addToBoard(name, img);
    setMenu(null);
    setNewBoard("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lb-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      {index > 0 && (
        <button
          className="lb-nav lb-prev"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(-1);
          }}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}
      {index < images.length - 1 && (
        <button
          className="lb-nav lb-next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(1);
          }}
          aria-label="Next image"
        >
          ›
        </button>
      )}

      <div className="lightbox" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="lb-img"
          src={img.srcs?.[quality] || img.full || img.thumb}
          alt={img.alt}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />

        <div className="lb-bar">
          <div className="lb-actions">
            <button
              className={`lb-btn fav ${isFavorite(img.id) ? "active" : ""}`}
              onClick={() => {
                toggleFavorite(img);
                setFavTick((t) => t + 1);
              }}
            >
              {isFavorite(img.id) ? "♥ Favourited" : "♡ Favourite"}
            </button>
            <div className="lb-menu-wrap">
              <button
                className="lb-btn"
                onClick={() => setMenu((m) => (m === "save" ? null : "save"))}
              >
                {saved ? "✓ Saved" : "+ Save"}
              </button>
              {menu === "save" && (
                <div className="card-menu">
                  {getBoardNames().map((b) => (
                    <button key={b} onClick={() => save(b)}>
                      {b}
                    </button>
                  ))}
                  <form
                    className="new-board"
                    onSubmit={(e) => {
                      e.preventDefault();
                      save(newBoard);
                    }}
                  >
                    <input
                      placeholder="New board name…"
                      value={newBoard}
                      onChange={(e) => setNewBoard(e.target.value)}
                    />
                    <button type="submit">Add</button>
                  </form>
                </div>
              )}
            </div>

            {img.dl && (
              <div className="lb-menu-wrap">
                <button
                  className="lb-btn"
                  onClick={() => setMenu((m) => (m === "share" ? null : "share"))}
                >
                  📤 Share
                </button>
                {menu === "share" && (
                  <div className="card-menu share-menu">
                    {canShareFiles && (
                      <button onClick={shareToApps} disabled={sharing}>
                        {sharing ? "Opening…" : "📲 Share to apps"}
                      </button>
                    )}
                    <span className="menu-label">✍️ AI captions</span>
                    <div className="cap-tabs">
                      {CAPTION_PLATFORMS.map((p) => (
                        <button
                          key={p.key}
                          className={`chip ${captions !== null && capPlatform === p.key ? "active" : ""}`}
                          onClick={() => loadCaptions(p.key)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    {captions === "loading" && <p className="cap-note">Writing captions…</p>}
                    {Array.isArray(captions) && captions.length === 0 && (
                      <p className="cap-note">Could not write captions — try again.</p>
                    )}
                    {Array.isArray(captions) &&
                      captions.map((c, i) => (
                        <button
                          key={i}
                          className="cap-item"
                          title="Click to copy"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(c);
                              setCopiedCap(i);
                              setTimeout(() => setCopiedCap(-1), 1200);
                            } catch {}
                          }}
                        >
                          {copiedCap === i ? "✓ Copied!" : c}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {img.dl && (
              <div className="lb-menu-wrap">
                <button
                  className="lb-btn primary"
                  onClick={() => setMenu((m) => (m === "dl" ? null : "dl"))}
                >
                  ⬇ Download
                </button>
                {menu === "dl" && (
                  <div className="card-menu">
                    {hasLogo && (
                      <label className="dl-brand-toggle">
                        <input
                          type="checkbox"
                          checked={withLogo}
                          onChange={(e) => setWithLogo(e.target.checked)}
                        />
                        💼 Stamp my logo
                      </label>
                    )}
                    <span className="menu-label">Quality</span>
                    {QUALITY_OPTS.map(
                      (q) =>
                        (img.dls?.[q.key] || img.dl) && (
                          <a
                            key={q.key}
                            href={`${img.dls?.[q.key] || img.dl}${brandParam}`}
                            onClick={() => setMenu(null)}
                          >
                            {q.label}
                          </a>
                        )
                    )}
                    <span className="menu-label">Social sizes</span>
                    {DL_PRESETS.map((p) => {
                      const base = img.dls?.ultra || img.dls?.high || img.dl;
                      return (
                        <a
                          key={p.key}
                          href={`${base}&size=${p.key}${brandParam}`}
                          onClick={() => setMenu(null)}
                        >
                          {p.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
