"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : { profile: null }))
      .then((d) => setUser(d.profile))
      .catch(() => {});
  }, []);

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
        <a href="/creators">Creators</a>
        <a href="/collections">Collections</a>
        <a href="/pricing">Pricing</a>
        {user && (
          <a className="nav-user" href="/profile" title="My profile">
            {user.dp ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar avatar-img" src={user.dp} alt="" />
            ) : (
              <span className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</span>
            )}
            {user.name?.split(" ")[0]}
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
