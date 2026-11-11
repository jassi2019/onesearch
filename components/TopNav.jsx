"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user))
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
        <a href="/collections">Collections</a>
        <a href="/pricing">Pricing</a>
        {user && (
          <span className="nav-user">
            <span className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</span>
            {user.name?.split(" ")[0]}
          </span>
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
