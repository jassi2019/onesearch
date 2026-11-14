"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBoards, FAV_BOARD } from "../lib/boards";

const GENDERS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];

export default function ProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [accountType, setAccountType] = useState("personal");
  const [dp, setDp] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandColors, setBrandColors] = useState([]);
  const logoRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState(false);
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
        setBrandLogo(d.profile.brandKit?.logo || "");
        setBrandColors(d.profile.brandKit?.colors || []);
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

  const pickLogo = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => {
      const max = 256;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      // PNG keeps logo transparency
      setBrandLogo(canvas.toDataURL("image/png"));
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
        body: JSON.stringify({
          name,
          gender,
          bio,
          dp,
          accountType,
          creatorConsent: consent,
          brandKit: { logo: brandLogo, colors: brandColors }
        })
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

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
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
            <option value="business">Business (Creator)</option>
          </select>
          <small className="field-hint">
            Business = creator account. Required for uploading images and appearing on the
            Creators page. Personal profiles stay private.
          </small>
        </label>

        {accountType === "business" && profile.accountType !== "business" && (
          <div className="consent-box">
            <strong>Creator Terms</strong>
            <ul>
              <li>Your name, photo, bio and uploads become publicly visible as a creator page.</li>
              <li>You own the rights to everything you upload.</li>
              <li>AI-generated or AI-edited images are not allowed — every upload is checked.</li>
              <li>Every upload automatically gets your personal watermark.</li>
              <li>OneSearch may remove content that breaks these rules.</li>
            </ul>
            <label className="consent-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>I have read and agree to the Creator Terms</span>
            </label>
          </div>
        )}

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

        <div className="brandkit">
          <strong className="bk-title">💼 Brand Kit</strong>
          <p className="field-hint" style={{ marginTop: 0 }}>
            Save your logo and brand colors — use them to filter searches, stamp your logo on
            downloads, and make on-brand buttons in Emoji Studio.
          </p>
          <div className="bk-logo-row">
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="bk-logo" src={brandLogo} alt="Brand logo" />
            ) : (
              <span className="bk-logo bk-logo-empty">Logo</span>
            )}
            <button type="button" className="dp-edit" onClick={() => logoRef.current?.click()}>
              {brandLogo ? "Change logo" : "Upload logo"}
            </button>
            {brandLogo && (
              <button type="button" className="dp-remove" onClick={() => setBrandLogo("")}>
                Remove
              </button>
            )}
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={pickLogo} />
          </div>
          <div className="bk-colors">
            {brandColors.map((c, i) => (
              <span className="bk-color" key={i}>
                <input
                  type="color"
                  value={c}
                  onChange={(e) =>
                    setBrandColors((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))
                  }
                />
                <button
                  type="button"
                  aria-label="Remove color"
                  onClick={() => setBrandColors((prev) => prev.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </span>
            ))}
            {brandColors.length < 4 && (
              <button
                type="button"
                className="bk-add"
                onClick={() => setBrandColors((prev) => [...prev, "#a78bfa"])}
              >
                + Add color
              </button>
            )}
          </div>
        </div>

        {msg && <p className={msg.ok ? "auth-ok" : "auth-error"}>{msg.text}</p>}

        <button
          type="submit"
          className="plan-cta"
          disabled={saving || (accountType === "business" && profile.accountType !== "business" && !consent)}
        >
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
        <button type="button" className="profile-logout" onClick={logout} disabled={loggingOut}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </div>
  );
}
