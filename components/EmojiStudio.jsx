"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DATA_URL = "https://cdn.jsdelivr.net/npm/unicode-emoji-json@0.8.0/data-by-group.json";
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

export default function EmojiStudio() {
  const [tab, setTab] = useState("library");
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => r.json())
      .then((raw) =>
        setGroups(
          Array.isArray(raw) ? Object.fromEntries(raw.map((g) => [g.name, g.emojis])) : raw
        )
      )
      .catch(() => setError("Could not load the emoji library. Check your connection and retry."));
  }, []);

  return (
    <div className="emoji-studio">
      <div className="tab-bar">
        <button className={`chip ${tab === "library" ? "active" : ""}`} onClick={() => setTab("library")}>
          😀 Emoji Library
        </button>
        <button className={`chip ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>
          🎨 Create Your Own
        </button>
      </div>

      {error && <p className="empty">{error}</p>}
      {!groups && !error && (
        <div className="search-loader">
          <div className="dots"><span /><span /><span /></div>
          <p>Loading emojis…</p>
        </div>
      )}

      {groups && tab === "library" && <Library groups={groups} />}
      {groups && tab === "create" && <Creator groups={groups} />}
    </div>
  );
}

function flatten(groups) {
  const out = [];
  for (const [group, items] of Object.entries(groups)) {
    for (const it of items) out.push({ ...it, group });
  }
  return out;
}

function Library({ groups }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");
  const [limit, setLimit] = useState(300);

  const all = useMemo(() => flatten(groups), [groups]);
  const cats = ["All", ...Object.keys(groups)];

  const filtered = useMemo(() => {
    let list = cat === "All" ? all : all.filter((e) => e.group === cat);
    const query = q.trim().toLowerCase();
    if (query) list = list.filter((e) => e.name.toLowerCase().includes(query));
    return list;
  }, [all, cat, q]);

  const copy = async (e) => {
    try {
      await navigator.clipboard.writeText(e.emoji);
      setCopied(e.emoji);
      setTimeout(() => setCopied(""), 1200);
    } catch {}
  };

  const downloadPng = (e) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.font = `200px ${EMOJI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(e.emoji, 128, 140);
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${e.slug || "emoji"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };

  return (
    <>
      <div className="emoji-controls">
        <input
          className="emoji-search"
          placeholder="Search emojis… e.g. heart, fire, laugh"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(300);
          }}
        />
      </div>
      <div className="suggestions emoji-cats">
        {cats.map((c) => (
          <span
            key={c}
            className={`chip ${cat === c ? "active" : ""}`}
            onClick={() => {
              setCat(c);
              setLimit(300);
            }}
          >
            {c}
          </span>
        ))}
      </div>

      <p className="status">{filtered.length.toLocaleString()} emojis · click to copy</p>

      <div className="emoji-grid">
        {filtered.slice(0, limit).map((e) => (
          <button
            key={e.emoji}
            className="emoji-cell"
            title={`${e.name} — click to copy`}
            onClick={() => copy(e)}
            onContextMenu={(ev) => {
              ev.preventDefault();
              downloadPng(e);
            }}
          >
            {copied === e.emoji ? "✓" : e.emoji}
          </button>
        ))}
      </div>

      {filtered.length > limit && (
        <button className="load-more" onClick={() => setLimit((l) => l + 300)}>
          Show more
        </button>
      )}
      <p className="status">Tip: right-click (ya mobile pe long-press menu) se PNG download</p>
    </>
  );
}

const BG_SHAPES = ["circle", "rounded", "square", "none"];

function Creator({ groups }) {
  const canvasRef = useRef(null);
  const all = useMemo(() => flatten(groups), [groups]);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState("main");
  const [cfg, setCfg] = useState({
    bgShape: "circle",
    color1: "#6d5cf5",
    color2: "#ff5e8e",
    useGrad: true,
    main: "😎",
    mainSize: 300,
    mainRot: 0,
    overlay: "",
    ovSize: 130,
    ovX: 60,
    ovY: 60,
    text: "",
    textColor: "#ffffff"
  });

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const picks = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = query ? all.filter((e) => e.name.toLowerCase().includes(query)) : all;
    return list.slice(0, 60);
  }, [all, q]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const S = 512;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, S, S);

    if (cfg.bgShape !== "none") {
      let fill = cfg.color1;
      if (cfg.useGrad) {
        const g = ctx.createLinearGradient(0, 0, S, S);
        g.addColorStop(0, cfg.color1);
        g.addColorStop(1, cfg.color2);
        fill = g;
      }
      ctx.fillStyle = fill;
      ctx.beginPath();
      if (cfg.bgShape === "circle") ctx.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2);
      else if (cfg.bgShape === "rounded") ctx.roundRect(6, 6, S - 12, S - 12, 110);
      else ctx.rect(6, 6, S - 12, S - 12);
      ctx.fill();
    }

    const drawEmoji = (emoji, size, x, y, rot) => {
      if (!emoji) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.font = `${size}px ${EMOJI_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, 0, size * 0.06);
      ctx.restore();
    };

    drawEmoji(cfg.main, cfg.mainSize, S / 2, S / 2 - (cfg.text ? 20 : 0), cfg.mainRot);
    drawEmoji(cfg.overlay, cfg.ovSize, S / 2 + (cfg.ovX / 100) * (S / 2 - 60), S / 2 + (cfg.ovY / 100) * (S / 2 - 60), 0);

    if (cfg.text) {
      ctx.font = `bold 64px "Segoe UI", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = cfg.textColor;
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 6;
      ctx.strokeText(cfg.text, 256, 452);
      ctx.fillText(cfg.text, 256, 452);
    }
  }, [cfg]);

  const download = () => {
    canvasRef.current.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "my-emoji.png";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };

  return (
    <div className="creator-layout">
      <div className="creator-preview">
        <canvas ref={canvasRef} width={512} height={512} />
        <button className="plan-cta" onClick={download}>
          ⬇ Download PNG
        </button>
      </div>

      <div className="creator-panel">
        <label className="cp-label">
          Background
          <span className="cp-row">
            {BG_SHAPES.map((s) => (
              <span key={s} className={`chip ${cfg.bgShape === s ? "active" : ""}`} onClick={() => set("bgShape", s)}>
                {s}
              </span>
            ))}
          </span>
        </label>
        <span className="cp-row">
          <input type="color" value={cfg.color1} onChange={(e) => set("color1", e.target.value)} />
          <input type="color" value={cfg.color2} onChange={(e) => set("color2", e.target.value)} disabled={!cfg.useGrad} />
          <label className="cp-check">
            <input type="checkbox" checked={cfg.useGrad} onChange={(e) => set("useGrad", e.target.checked)} />
            Gradient
          </label>
        </span>

        <label className="cp-label">
          Main emoji size <input type="range" min="80" max="440" value={cfg.mainSize} onChange={(e) => set("mainSize", +e.target.value)} />
        </label>
        <label className="cp-label">
          Rotation <input type="range" min="-45" max="45" value={cfg.mainRot} onChange={(e) => set("mainRot", +e.target.value)} />
        </label>
        <label className="cp-label">
          Sticker size <input type="range" min="60" max="220" value={cfg.ovSize} onChange={(e) => set("ovSize", +e.target.value)} />
        </label>
        <span className="cp-row">
          <label className="cp-label half">
            Sticker X <input type="range" min="-100" max="100" value={cfg.ovX} onChange={(e) => set("ovX", +e.target.value)} />
          </label>
          <label className="cp-label half">
            Sticker Y <input type="range" min="-100" max="100" value={cfg.ovY} onChange={(e) => set("ovY", +e.target.value)} />
          </label>
        </span>
        {cfg.overlay && (
          <button className="board-delete" onClick={() => set("overlay", "")}>
            Remove sticker ({cfg.overlay})
          </button>
        )}

        <label className="cp-label">
          Text
          <span className="cp-row">
            <input
              className="emoji-search"
              maxLength={12}
              placeholder="Optional text…"
              value={cfg.text}
              onChange={(e) => set("text", e.target.value)}
            />
            <input type="color" value={cfg.textColor} onChange={(e) => set("textColor", e.target.value)} />
          </span>
        </label>

        <div className="cp-pick-head">
          <span className="cp-row">
            <span className={`chip ${target === "main" ? "active" : ""}`} onClick={() => setTarget("main")}>
              Set main
            </span>
            <span className={`chip ${target === "overlay" ? "active" : ""}`} onClick={() => setTarget("overlay")}>
              Set sticker
            </span>
          </span>
          <input className="emoji-search" placeholder="Search emoji…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="emoji-grid mini">
          {picks.map((e) => (
            <button
              key={e.emoji}
              className="emoji-cell"
              title={e.name}
              onClick={() => set(target === "main" ? "main" : "overlay", e.emoji)}
            >
              {e.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
