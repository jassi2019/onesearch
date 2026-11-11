"use client";

import { useEffect, useRef, useState } from "react";
import { getBoards, FAV_BOARD } from "../lib/boards";

const GENDERS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];

export default function ProfileForm() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [accountType, setAccountType] = useState("personal");
  const [dp, setDp] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }
  const [stats, setStats] = useState({ boards: 0, images: 0, favs: 0 });
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!d.profile) return;
        setProfile(d.profile);
        setName(d.profile.name);
        setGender(d.profile.gender);
        setBio(d.profile.bio);
        setDp(d.profile.dp);
        setAccountType(d.profile.accountType || "personal");
      })
      .catch(() => {});

    const boards = getBoards();
    const names = Object.keys(boards);
    setStats({
      boards: names.filter((n) => n !== FAV_BOARD).length,
      images: names.reduce((s, n) => s + boards[n].length, 0),
      favs: (boards[FAV_BOARD] || []).length
    });
  }, []);

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      setDp(canvas.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, bio, dp, accountType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setProfile(data.profile);
      setMsg({ ok: true, text: "Profile saved!" });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="search-loader">
        <div className="dots"><span /><span /><span /></div>
        <p>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <form className="profile-card" onSubmit={save}>
        <div className="dp-wrap">
          {dp ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="dp" src={dp} alt="Profile" />
          ) : (
            <span className="dp dp-empty">{name?.[0]?.toUpperCase() || "U"}</span>
          )}
          <button type="button" className="dp-edit" onClick={() => fileRef.current?.click()}>
            Change photo
          </button>
          {dp && (
            <button type="button" className="dp-remove" onClick={() => setDp("")}>
              Remove
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={pickPhoto}
          />
        </div>

        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        </label>

        <label>
          Email
          <input value={profile.email} disabled />
        </label>

        <label>
          Account type
          <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
        </label>

        <label>
          Gender
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Tell us a little about yourself…"
          />
        </label>

        {msg && <p className={msg.ok ? "auth-ok" : "auth-error"}>{msg.text}</p>}

        <button type="submit" className="plan-cta" disabled={saving}>
          {saving ? <span className="spinner" /> : "Save profile"}
        </button>
      </form>

      <div className="profile-side">
        {profile.pageId && (
          <a className="plan-cta mypage-btn" href={`/u/${profile.pageId}`}>
            🖼 View my page
          </a>
        )}
        <div className="stat-card">
          <span className="stat-num">{stats.favs}</span>
          <span>Favourites</span>
          <a href="/collections">View ♥</a>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.boards}</span>
          <span>Boards</span>
          <a href="/collections">Open collections</a>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.images}</span>
          <span>Saved images</span>
          <a href="/">Search more</a>
        </div>
      </div>
    </div>
  );
}
