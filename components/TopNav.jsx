"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TopNav() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : { profile: null }))
      .then((d) => setUser(d.profile))
      .catch(() => {});
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : { notifications: [], unread: 0 }))
      .then((d) => {
        setNotifs(d.notifications || []);
        setUnread(d.unread || 0);
      })
      .catch(() => {});
  }, []);

  const togglePanel = () => {
    const opening = !panelOpen;
    setPanelOpen(opening);
    if (opening && unread > 0) {
      setUnread(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      fetch("/api/notifications", { method: "POST" }).catch(() => {});
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="topnav">
      <a className="brand" href="/">
        One<span>Search</span>
      </a>
      <div className="nav-links">
        <a href="/emoji">Emoji</a>
        <a href="/creators">Creators</a>
        <a href="/collections">Collections</a>
        <a href="/pricing">Pricing</a>
        <a href="/contact" className="nav-contact" title="Contact us">
          <span className="nc-text">Contact</span>
          <svg
            className="nc-icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="m2 7 10 7 10-7" />
          </svg>
        </a>
        {user && (
          <span className="bell-wrap">
            <button className="bell" onClick={togglePanel} aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unread > 0 && <span className="bell-badge">{unread > 9 ? "9+" : unread}</span>}
            </button>
            {panelOpen && (
              <div className="notif-panel">
                <div className="notif-head">Notifications</div>
                {notifs.length === 0 ? (
                  <p className="notif-empty">No notifications yet</p>
                ) : (
                  notifs.map((n) => (
                    <a
                      className={`notif-item ${n.read ? "" : "unread"}`}
                      key={n.id}
                      href={n.fromPageId ? `/u/${n.fromPageId}` : "#"}
                    >
                      <span className="notif-icon">{n.type === "follow" ? "👤" : "🖼"}</span>
                      <span>
                        {n.text}
                        <small>{timeAgo(n.createdAt)}</small>
                      </span>
                    </a>
                  ))
                )}
              </div>
            )}
          </span>
        )}
        {user && (
          <a className="nav-user" href="/profile" title="My profile">
            {user.dp ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar avatar-img" src={user.dp} alt="" />
            ) : (
              <span className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</span>
            )}
            <span className="uname">{user.name?.split(" ")[0]}</span>
          </a>
        )}
        {user && (
          <button className="nav-logout" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
