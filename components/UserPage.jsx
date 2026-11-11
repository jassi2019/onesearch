"use client";

import { useEffect, useRef, useState } from "react";

export default function UserPage({ pageId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    fetch(`/api/pages/${pageId}`)
      .then((r) => r.json())
      .then((d) => (d.page ? setData(d) : setError(d.error || "Page not found")))
      .catch(() => setError("Could not load page"));
  };
  useEffect(load, [pageId]);

  const toggleFollow = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/follow`, { method: "POST" });
      const d = await res.json();
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          isFollowing: d.isFollowing,
          page: { ...prev.page, followerCount: d.followerCount }
        }));
      }
    } finally {
      setBusy(false);
    }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed");
      setData((prev) => ({
        ...prev,
        page: { ...prev.page, images: [d.image, ...prev.page.images] }
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/uploads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          page: { ...prev.page, images: prev.page.images.filter((i) => i.id !== id) }
        }));
      }
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) return <p className="empty">{error}</p>;
  if (!data) {
    return (
      <div className="search-loader">
        <div className="dots"><span /><span /><span /></div>
        <p>Loading page…</p>
      </div>
    );
  }

  const { page, isOwner, isFollowing } = data;

  return (
    <>
      <div className="page-head">
        {page.dp ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="dp page-dp" src={page.dp} alt="" />
        ) : (
          <span className="dp dp-empty page-dp">{page.name?.[0]?.toUpperCase() || "U"}</span>
        )}
        <div className="page-info">
          <h2>
            {page.name}
            {page.accountType === "business" && <span className="biz-badge">Business</span>}
          </h2>
          {page.bio && <p className="page-bio">{page.bio}</p>}
          <p className="page-stats">
            <strong>{page.followerCount}</strong> followers ·{" "}
            <strong>{page.images.length}</strong> uploads
          </p>
        </div>
        <div className="page-actions">
          {isOwner ? (
            <>
              <button className="plan-cta" onClick={() => fileRef.current?.click()} disabled={busy}>
                {busy ? <span className="spinner" /> : "⬆ Upload image"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
              <p className="upload-note">
                Original photos only — AI images are not allowed. Uploads get your watermark
                automatically.
              </p>
            </>
          ) : (
            <button
              className={`plan-cta ${isFollowing ? "ghost-active" : ""}`}
              onClick={toggleFollow}
              disabled={busy}
            >
              {busy ? <span className="spinner" /> : isFollowing ? "✓ Following" : "+ Follow"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="auth-error" style={{ textAlign: "center" }}>{error}</p>}

      {page.images.length === 0 ? (
        <p className="empty">
          {isOwner ? "Upload your first image to start your page!" : "No uploads yet."}
        </p>
      ) : (
        <div className="grid">
          {page.images.map((img) => (
            <figure className="card" key={img.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/uploads/file/${page.pageId}/${img.id}`}
                alt={img.title || "Upload"}
                loading="lazy"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                style={{ display: "block", width: "100%" }}
              />
              {isOwner && (
                <div className="card-actions">
                  <button className="act danger" title="Delete" onClick={() => remove(img.id)}>
                    ✕
                  </button>
                </div>
              )}
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
