"use client";

import { useEffect, useState } from "react";
import { getBoards, removeFromBoard, deleteBoard } from "../lib/boards";
import Lightbox from "./Lightbox";

export default function CollectionsView() {
  const [boards, setBoards] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { board, index }

  const refresh = () => setBoards(getBoards());
  useEffect(refresh, []);

  if (boards === null) return null;

  const names = Object.keys(boards);
  if (!names.length) {
    return (
      <p className="empty">
        No boards yet. Search images and hit the <strong>+</strong> button to save them here.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: 40 }}>
      {names.map((name) => (
        <section key={name}>
          <div className="board-head">
            <h2>
              {name} <span>({boards[name].length})</span>
            </h2>
            <button
              className="board-delete"
              onClick={() => {
                deleteBoard(name);
                refresh();
              }}
            >
              Delete board
            </button>
          </div>
          <div className="grid">
            {boards[name].map((img, idx) => (
              <figure className="card" key={img.id}>
                <button
                  className="img-open"
                  onClick={() => setLightbox({ board: name, index: idx })}
                  aria-label="Open image"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.thumb} alt={img.alt} loading="lazy" />
                </button>
                <figcaption className="meta">
                  <a
                    href={img.photographerUrl || img.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {img.photographer}
                  </a>
                  <span className="meta-actions">
                    {img.dl && (
                      <a className="dl" href={img.dl} title="Download image">
                        ⬇
                      </a>
                    )}
                    <button
                      className="dl"
                      title="Remove from board"
                      onClick={() => {
                        removeFromBoard(name, img.id);
                        refresh();
                      }}
                    >
                      ✕
                    </button>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      {lightbox && boards[lightbox.board] && (
        <Lightbox
          images={boards[lightbox.board]}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(dir) =>
            setLightbox((lb) => ({
              ...lb,
              index: Math.min(boards[lb.board].length - 1, Math.max(0, lb.index + dir))
            }))
          }
        />
      )}
    </div>
  );
}
