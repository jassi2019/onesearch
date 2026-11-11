"use client";

import { useState } from "react";
import { addToBoard, getBoardNames } from "../lib/boards";
import Lightbox from "./Lightbox";

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

export default function ImageGrid({ images, quality = "high" }) {
  const [menu, setMenu] = useState(null); // { id, type: "dl" | "save" }
  const [flash, setFlash] = useState(null);
  const [newBoard, setNewBoard] = useState("");
  const [lightbox, setLightbox] = useState(null);

  if (!images.length) return null;

  const toggleMenu = (id, type) =>
    setMenu((m) => (m && m.id === id && m.type === type ? null : { id, type }));

  const save = (img, board) => {
    const name = board.trim();
    if (!name) return;
    addToBoard(name, img);
    setMenu(null);
    setNewBoard("");
    setFlash(img.id);
    setTimeout(() => setFlash(null), 1400);
  };

  return (
    <div className="grid">
      {images.map((img, idx) => (
        <figure className="card" key={img.id}>
          <button className="img-open" onClick={() => setLightbox(idx)} aria-label="Open image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.srcs?.[quality] || img.thumb} alt={img.alt} loading="lazy" />
          </button>
          <div className="card-overlay" />
          <div className="card-actions">
            <button
              className="act"
              onClick={() => toggleMenu(img.id, "save")}
              title="Save to board"
              aria-label="Save to board"
            >
              {flash === img.id ? "✓" : "+"}
            </button>
            {img.dl && (
              <button
                className="act"
                onClick={() => toggleMenu(img.id, "dl")}
                title="Download image"
                aria-label="Download image"
              >
                ⬇
              </button>
            )}
          </div>

          {menu && menu.id === img.id && menu.type === "dl" && (
            <div className="card-menu">
              <span className="menu-label">Quality</span>
              {QUALITY_OPTS.map(
                (q) =>
                  (img.dls?.[q.key] || img.dl) && (
                    <a
                      key={q.key}
                      href={img.dls?.[q.key] || img.dl}
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
                  <a key={p.key} href={`${base}&size=${p.key}`} onClick={() => setMenu(null)}>
                    {p.label}
                  </a>
                );
              })}
            </div>
          )}

          {menu && menu.id === img.id && menu.type === "save" && (
            <div className="card-menu">
              {getBoardNames().map((b) => (
                <button key={b} onClick={() => save(img, b)}>
                  {b}
                </button>
              ))}
              <form
                className="new-board"
                onSubmit={(e) => {
                  e.preventDefault();
                  save(img, newBoard);
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
        </figure>
      ))}

      {lightbox !== null && (
        <Lightbox
          images={images}
          quality={quality}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={(dir) =>
            setLightbox((i) => Math.min(images.length - 1, Math.max(0, i + dir)))
          }
        />
      )}
    </div>
  );
}
