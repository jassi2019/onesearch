"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err === "google-not-configured") setError("Google login is not set up yet");
    else if (err === "google-failed") setError("Google sign-in failed, please try again");
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form className="auth-card" onSubmit={submit}>
      <a className="brand" href="/login">
        One<span>Search</span>
      </a>
      <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
      <p className="auth-sub">
        {isSignup
          ? "Join to search, save and download millions of images."
          : "Log in to continue to your image workspace."}
      </p>

      <a className="google-btn" href="/api/auth/google/start">
        <GoogleIcon />
        Continue with Google
      </a>

      <div className="auth-divider">
        <span>or</span>
      </div>

      {isSignup && (
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder={isSignup ? "Password (6+ characters)" : "Password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" className="plan-cta" disabled={loading}>
        {loading ? <span className="spinner" /> : isSignup ? "Sign up" : "Log in"}
      </button>

      <p className="auth-switch">
        {isSignup ? (
          <>
            Already have an account? <a href="/login">Log in</a>
          </>
        ) : (
          <>
            New here? <a href="/signup">Create an account</a>
          </>
        )}
      </p>
    </form>
  );
}
