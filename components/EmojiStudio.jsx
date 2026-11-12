"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DATA_URL = "https://cdn.jsdelivr.net/npm/unicode-emoji-json@0.8.0/data-by-group.json";
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

const PRESETS = [
  { label: "Like", main: "👍", text: "LIKE", motion: "pop", bgShape: "circle", color1: "#2563eb", color2: "#60a5fa", useGrad: true },
  { label: "Subscribe", main: "🔔", text: "SUBSCRIBE", motion: "shake", bgShape: "rounded", color1: "#ff0000", color2: "#ff4d4d", useGrad: true },
  { label: "Follow", main: "➕", text: "FOLLOW", motion: "pulse", bgShape: "circle", color1: "#7c5cff", color2: "#ff5e8e", useGrad: true },
  { label: "Love", main: "❤️", text: "", motion: "heartbeat", bgShape: "none" },
  { label: "Fire", main: "🔥", text: "", motion: "pulse", bgShape: "none" },
  { label: "100", main: "💯", text: "", motion: "bounce", bgShape: "none" },
  { label: "LOL", main: "😂", text: "", motion: "bounce", bgShape: "none" },
  { label: "Clap", main: "👏", text: "", motion: "shake", bgShape: "none" },
  { label: "Party", main: "🎉", text: "", motion: "pop", bgShape: "none" },
  { label: "Point Down", main: "👇", text: "", motion: "bounce", bgShape: "none" },
  { label: "Point Up", main: "☝️", text: "", motion: "bounce", bgShape: "none" },
  { label: "New", main: "✨", text: "NEW", motion: "spin", bgShape: "circle", color1: "#f59e0b", color2: "#fbbf24", useGrad: true },
  { label: "Sale", main: "💰", text: "SALE", motion: "heartbeat", bgShape: "rounded", color1: "#16a34a", color2: "#4ade80", useGrad: true },
  { label: "Rocket", main: "🚀", text: "", motion: "swing", bgShape: "none" },
  { label: "Mind Blown", main: "🤯", text: "", motion: "shake", bgShape: "none" },
  { label: "Heart Eyes", main: "😍", text: "", motion: "heartbeat", bgShape: "none" },
  { label: "Eyes", main: "👀", text: "", motion: "wave", bgShape: "none" },
  { label: "Warning", main: "⚠️", text: "", motion: "pulse", bgShape: "none" },
  { label: "Check", main: "✅", text: "", motion: "pop", bgShape: "none" },
  { label: "Crown", main: "👑", text: "", motion: "swing", bgShape: "none" }
];

export default function EmojiStudio() {
  const [tab, setTab] = useState("library");
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");
  const [preset, setPreset] = useState(null);
  const [presetKey, setPresetKey] = useState(0);

  const usePreset = (p) => {
    setPreset(p);
    setPresetKey((k) => k + 1);
    setTab("create");
  };

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
        <button className={`chip ${tab === "trending" ? "active" : ""}`} onClick={() => setTab("trending")}>
          🔥 Trending
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
      {tab === "trending" && <Trending onUse={usePreset} />}
      {groups && tab === "create" && (
        <Creator groups={groups} preset={preset} presetKey={presetKey} />
      )}
    </div>
  );
}

function Trending({ onUse }) {
  return (
    <>
      <p className="status">
        Ready-made animated elements for YouTube videos, Shorts &amp; Reels — click to customise,
        then export as GIF or 🎬 green-screen Video for your editor
      </p>
      <div className="preset-grid">
        {PRESETS.map((p) => (
          <button key={p.label} className="preset-card" onClick={() => onUse(p)}>
            <span className={`preset-emoji anim-${p.motion}`}>{p.main}</span>
            <span className="preset-label">{p.text || p.label}</span>
            <span className="preset-motion">{p.motion}</span>
          </button>
        ))}
      </div>
    </>
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
const MOTIONS = [
  "none", "bounce", "float", "pulse", "heartbeat", "pop", "zoom", "spin", "swing",
  "wave", "shake", "wobble", "jello", "tada", "rubber", "flip", "orbit", "slide",
  "drop", "blink", "flash"
];

function easeOutBounce(x) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}

const TAU = Math.PI * 2;

function motionTransform(motion, t) {
  const base = { dx: 0, dy: 0, rot: 0, scale: 1, scaleX: null, scaleY: null, alpha: 1 };
  switch (motion) {
    case "bounce":
      return { ...base, dy: -Math.abs(Math.sin((t * Math.PI) / 0.6)) * 34 };
    case "float":
      return { ...base, dy: Math.sin((t * TAU) / 2.4) * 14 };
    case "pulse":
      return { ...base, scale: 1 + 0.14 * Math.sin(t * TAU) };
    case "heartbeat": {
      const p = (t % 1) * TAU;
      const beat = Math.max(0, Math.sin(p)) ** 3 + 0.7 * Math.max(0, Math.sin(p + 2.1)) ** 8;
      return { ...base, scale: 1 + 0.2 * beat };
    }
    case "pop": {
      const p = (t % 1.3) / 1.3;
      const s = p < 0.35 ? 0.55 + 0.45 * Math.sin((p / 0.35) * Math.PI * 0.5) * 1.35 : 1;
      return { ...base, scale: Math.min(s, 1.18) };
    }
    case "zoom":
      return { ...base, scale: 0.75 + 0.35 * (0.5 + 0.5 * Math.sin((t * TAU) / 1.6)) };
    case "spin":
      return { ...base, rot: (t * 360) / 2 };
    case "swing": {
      const s = Math.sin(t * Math.PI * 1.25);
      return { ...base, dx: s * 14, rot: s * 20 };
    }
    case "wave":
      return { ...base, dy: Math.sin(t * Math.PI) * 16, rot: Math.sin(t * Math.PI) * 10 };
    case "shake":
      return { ...base, dx: Math.sin(t * 42) * 9, rot: Math.sin(t * 42) * 5 };
    case "wobble": {
      const p = Math.sin((t * TAU) / 1.2);
      return { ...base, dx: p * 24, rot: p * 9 };
    }
    case "jello": {
      const s = Math.sin((t * TAU) / 1.1);
      return { ...base, scaleX: 1 + 0.2 * s, scaleY: 1 - 0.2 * s };
    }
    case "tada": {
      const p = (t % 1.5) / 1.5;
      if (p < 0.12) return { ...base, scale: 1 - 0.1 * Math.sin((p / 0.12) * Math.PI) };
      if (p < 0.6)
        return { ...base, scale: 1.12, rot: Math.sin(((p - 0.12) / 0.48) * Math.PI * 6) * 8 };
      return base;
    }
    case "rubber": {
      const p = (t % 1.2) / 1.2;
      const k = Math.sin(p * TAU) * (1 - p);
      return { ...base, scaleX: 1 + 0.3 * k, scaleY: 1 - 0.3 * k };
    }
    case "flip": {
      const c = Math.cos((t * TAU) / 1.8);
      const sx = Math.sign(c || 1) * Math.max(Math.abs(c), 0.06);
      return { ...base, scaleX: sx, scaleY: 1 };
    }
    case "orbit":
      return { ...base, dx: Math.cos((t * TAU) / 2) * 26, dy: Math.sin((t * TAU) / 2) * 26 };
    case "slide":
      return { ...base, dx: Math.sin((t * TAU) / 1.8) * 60 };
    case "drop": {
      const p = (t % 1.4) / 1.4;
      if (p < 0.55) return { ...base, dy: -430 * (1 - easeOutBounce(p / 0.55)) };
      return base;
    }
    case "blink":
      return { ...base, alpha: 0.25 + 0.75 * (0.5 + 0.5 * Math.sin((t * TAU) / 0.9)) };
    case "flash": {
      const p = t % 1.2;
      return { ...base, alpha: p < 0.1 || (p > 0.2 && p < 0.3) ? 0.12 : 1 };
    }
    default:
      return base;
  }
}

function drawScene(ctx, cfg, t) {
  const S = 512;
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

  const m = motionTransform(cfg.motion, t * (cfg.speed || 1));
  const sx = m.scaleX ?? m.scale;
  const sy = m.scaleY ?? m.scale;

  const drawEmoji = (emoji, size, x, y, rot, scX = 1, scY = 1, alpha = 1) => {
    if (!emoji) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(scX, scY);
    ctx.font = `${size}px ${EMOJI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 0, size * 0.06);
    ctx.restore();
  };

  drawEmoji(
    cfg.main,
    cfg.mainSize,
    S / 2 + m.dx,
    S / 2 - (cfg.text ? 20 : 0) + m.dy,
    cfg.mainRot + m.rot,
    sx,
    sy,
    m.alpha
  );
  drawEmoji(
    cfg.overlay,
    cfg.ovSize,
    S / 2 + (cfg.ovX / 100) * (S / 2 - 60) + m.dx * 0.5,
    S / 2 + (cfg.ovY / 100) * (S / 2 - 60) + m.dy * 0.5,
    m.rot * 0.5,
    sx,
    sy,
    m.alpha
  );

  if (cfg.text) {
    ctx.font = `bold 64px "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = cfg.textColor;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 6;
    ctx.strokeText(cfg.text, 256, 452);
    ctx.fillText(cfg.text, 256, 452);
  }
}

function Creator({ groups, preset, presetKey }) {
  const canvasRef = useRef(null);
  const all = useMemo(() => flatten(groups), [groups]);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState("main");
  const [recording, setRecording] = useState(false);
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
    textColor: "#ffffff",
    motion: "none",
    speed: 1
  });

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  useEffect(() => {
    if (!preset) return;
    setCfg((c) => ({ ...c, overlay: "", useGrad: false, text: "", ...preset }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey]);

  const picks = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = query ? all.filter((e) => e.name.toLowerCase().includes(query)) : all;
    return list.slice(0, 60);
  }, [all, q]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || recording) return;
    const ctx = canvas.getContext("2d");

    if (cfg.motion === "none") {
      drawScene(ctx, cfg, 0);
      return;
    }

    let raf;
    const start = performance.now();
    const loop = (now) => {
      drawScene(ctx, cfg, (now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cfg, recording]);

  const saveBlob = (blob, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPng = () => canvasRef.current.toBlob((b) => saveBlob(b, "my-emoji.png"));

  const downloadJpg = () => {
    const S = 512;
    const tmp = document.createElement("canvas");
    tmp.width = tmp.height = S;
    const ctx = tmp.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, S, S);
    ctx.drawImage(canvasRef.current, 0, 0);
    tmp.toBlob((b) => saveBlob(b, "my-emoji.jpg"), "image/jpeg", 0.92);
  };

  const xmlSafe = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const downloadSvg = () => {
    const S = 512;
    let bg = "";
    const fillRef = cfg.useGrad ? "url(#g)" : cfg.color1;
    if (cfg.bgShape === "circle") bg = `<circle cx="256" cy="256" r="250" fill="${fillRef}"/>`;
    else if (cfg.bgShape === "rounded")
      bg = `<rect x="6" y="6" width="500" height="500" rx="110" fill="${fillRef}"/>`;
    else if (cfg.bgShape === "square")
      bg = `<rect x="6" y="6" width="500" height="500" fill="${fillRef}"/>`;

    const emojiEl = (emoji, size, x, y, rot) =>
      emoji
        ? `<text x="0" y="0" font-size="${size}" text-anchor="middle" dominant-baseline="central" font-family='${EMOJI_FONT.replace(/"/g, "")}' transform="translate(${x} ${y + size * 0.06}) rotate(${rot})">${xmlSafe(emoji)}</text>`
        : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cfg.color1}"/><stop offset="1" stop-color="${cfg.color2}"/></linearGradient></defs>
  ${bg}
  ${emojiEl(cfg.main, cfg.mainSize, 256, 256 - (cfg.text ? 20 : 0), cfg.mainRot)}
  ${emojiEl(cfg.overlay, cfg.ovSize, 256 + (cfg.ovX / 100) * 196, 256 + (cfg.ovY / 100) * 196, 0)}
  ${cfg.text ? `<text x="256" y="452" font-size="64" font-weight="bold" text-anchor="middle" font-family="Segoe UI, sans-serif" fill="${cfg.textColor}" stroke="rgba(0,0,0,0.45)" stroke-width="6" paint-order="stroke">${xmlSafe(cfg.text)}</text>` : ""}
</svg>`;
    saveBlob(new Blob([svg], { type: "image/svg+xml" }), "my-emoji.svg");
  };

  const ensureMotion = () => {
    if (cfg.motion === "none") {
      alert("Pehle koi motion select karo (bounce / spin / pulse / shake / wave)");
      return false;
    }
    return true;
  };

  const downloadWebm = () => {
    if (recording || !ensureMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
      alert("Video export is not supported in this browser — try Chrome or Edge.");
      return;
    }
    setRecording(true);
    const ctx = canvas.getContext("2d");

    let stream = canvas.captureStream(0);
    let track = stream.getVideoTracks()[0];
    const manual = typeof track.requestFrame === "function";
    if (!manual) {
      stream = canvas.captureStream(30);
      track = stream.getVideoTracks()[0];
    }

    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      saveBlob(new Blob(chunks, { type: "video/webm" }), "my-emoji.webm");
      setRecording(false);
    };
    rec.start();

    const fps = 30;
    const totalFrames = fps * 3;
    let frame = 0;
    const step = () => {
      drawScene(ctx, cfg, frame / fps);
      if (manual) track.requestFrame();
      frame++;
      if (frame > totalFrames) {
        rec.stop();
        return;
      }
      setTimeout(step, 1000 / fps);
    };
    step();
  };

  const downloadGif = async () => {
    if (recording || !ensureMotion()) return;
    setRecording(true);
    try {
      if (!window.GIF) {
        const base = "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/";
        const workerSrc = await (await fetch(`${base}gif.worker.js`)).text();
        window.__gifWorkerUrl = URL.createObjectURL(
          new Blob([workerSrc], { type: "application/javascript" })
        );
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = `${base}gif.js`;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const gif = new window.GIF({
        workers: 2,
        quality: 10,
        width: 512,
        height: 512,
        workerScript: window.__gifWorkerUrl
      });
      const fps = 15;
      const frames = fps * 3;
      for (let f = 0; f < frames; f++) {
        drawScene(ctx, cfg, f / fps);
        gif.addFrame(ctx, { copy: true, delay: 1000 / fps });
      }
      await new Promise((resolve) => {
        gif.on("finished", (blob) => {
          saveBlob(blob, "my-emoji.gif");
          resolve();
        });
        gif.render();
      });
    } catch {
      alert("GIF export failed — try again");
    }
    setRecording(false);
  };

  return (
    <div className="creator-layout">
      <div className="creator-preview">
        <canvas ref={canvasRef} width={512} height={512} />
        <div className="dl-formats">
          <button className="plan-cta" onClick={downloadPng}>PNG</button>
          <button className="plan-cta" onClick={downloadJpg}>JPG</button>
          <button className="plan-cta" onClick={downloadSvg}>SVG</button>
          <button className="plan-cta" onClick={downloadGif} disabled={recording} title="3-second animated GIF">
            {recording ? <span className="spinner" /> : "GIF"}
          </button>
          <button
            className="plan-cta"
            onClick={downloadWebm}
            disabled={recording}
            title="3-second video — for video editors use the green screen preset"
          >
            {recording ? <span className="spinner" /> : "🎬 Video"}
          </button>
        </div>
        {cfg.motion === "none" && (
          <p className="upload-note" style={{ maxWidth: "none" }}>
            Tip: motion select karo toh Video export animated hoga
          </p>
        )}
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
          <span
            className="chip"
            title="Chroma-key background for video overlays"
            onClick={() => setCfg((c) => ({ ...c, bgShape: "square", color1: "#00ff00", useGrad: false }))}
          >
            🎬 Green screen
          </span>
        </span>

        <label className="cp-label">
          Motion ({MOTIONS.length - 1} effects)
          <span className="cp-row motion-row">
            {MOTIONS.map((mo) => (
              <span
                key={mo}
                className={`chip ${cfg.motion === mo ? "active" : ""}`}
                onClick={() => set("motion", mo)}
              >
                {mo}
              </span>
            ))}
          </span>
        </label>

        {cfg.motion !== "none" && (
          <label className="cp-label">
            Speed — {cfg.speed}x
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={cfg.speed}
              onChange={(e) => set("speed", +e.target.value)}
            />
          </label>
        )}

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
