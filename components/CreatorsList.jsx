"use client";

import { useEffect, useState } from "react";

export default function CreatorsList() {
  const [pages, setPages] = useState(null);

  useEffect(() => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((d) => setPages(d.pages || []))
      .catch(() => setPages([]));
  }, []);

  if (pages === null) {
    return (
      <div className="search-loader">
        <div className="dots"><span /><span /><span /></div>
        <p>Loading creators…</p>
      </div>
    );
  }

  if (!pages.length)
    return (
      <p className="empty">
        No creators yet — switch your account to Business in{" "}
        <a href="/profile">your profile</a> and be the first!
      </p>
    );

  return (
    <div className="creators-grid">
      {pages.map((p) => (
        <a className="creator-card" key={p.pageId} href={`/u/${p.pageId}`}>
          {p.dp ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="dp" src={p.dp} alt="" />
          ) : (
            <span className="dp dp-empty">{p.name?.[0]?.toUpperCase() || "U"}</span>
          )}
          <span className="creator-name">{p.name}</span>
          {p.accountType === "business" && <span className="biz-badge">Business</span>}
        </a>
      ))}
    </div>
  );
}
