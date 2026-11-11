"use client";

import { useEffect, useState } from "react";
import { getBoards, removeFromBoard, deleteBoard } from "../lib/boards";

export default function CollectionsView() {
  const [boards, setBoards] = useState(null);

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
            {boards[name].map((img) => (
              <figure className="card" key={img.id}>
                <a href={img.pageUrl} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.thumb} alt={img.alt} loading="lazy" />
                </a>
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
    </div>
  );
}
