"use client";

import { useEffect, useState } from "react";
import { addToBoard, getBoardNames } from "../lib/boards";

const DL_PRESETS = [
  { key: "", label: "Original" },
  { key: "ig", label: "Instagram 1080×1080" },
  { key: "story", label: "Story 1080×1920" },
  { key: "yt", label: "YouTube 1280×720" }
];

export default function Lightbox({ images, index, onClose, onNavigate }) {
  const img = images[index];
  const [menu, setMenu] = useState(null);
  const [newBoard, setNewBoard] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMenu(null);
    setSaved(false);
  }, [index]);

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
        <img className="lb-img" src={img.full || img.thumb} alt={img.alt} />

        <div className="lb-bar">
          <div className="lb-info">
            <a href={img.photographerUrl || img.pageUrl} target="_blank" rel="noopener noreferrer">
              {img.photographer}
            </a>
          </div>

          <div className="lb-actions">
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
                  className="lb-btn primary"
                  onClick={() => setMenu((m) => (m === "dl" ? null : "dl"))}
                >
                  ⬇ Download
                </button>
                {menu === "dl" && (
                  <div className="card-menu">
                    {DL_PRESETS.map((p) => (
                      <a
                        key={p.key}
                        href={p.key ? `${img.dl}&size=${p.key}` : img.dl}
                        onClick={() => setMenu(null)}
                      >
                        {p.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <a
              className="lb-btn ghost"
              href={img.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
