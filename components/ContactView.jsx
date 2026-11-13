"use client";

import { useState } from "react";

const TOPICS = [
  {
    id: "support",
    icon: "💬",
    title: "Support",
    desc: "Stuck somewhere? Downloads, account, uploads — we'll sort it out."
  },
  {
    id: "partnership",
    icon: "🤝",
    title: "Partnership",
    desc: "API access, white-label, bulk licensing or working together."
  },
  {
    id: "feedback",
    icon: "✨",
    title: "Feedback",
    desc: "An idea, a feature request, or something that bugs you."
  }
];

const FAQS = [
  {
    q: "Are the images really free to use?",
    a: "Every image comes from free stock libraries. Use the “Commercial use ✓” filter if you need images cleared for business projects, and always check the license on download."
  },
  {
    q: "How do I become a creator?",
    a: "Create an account, open your profile, and upload from your creator page. AI-generated images are not allowed — every upload is checked and gets your personal watermark automatically."
  },
  {
    q: "Can I use OneSearch on my phone?",
    a: "Yes — open the site in Safari or Chrome and tap “Add to Home Screen”. OneSearch installs as a full-screen app with its own icon."
  },
  {
    q: "How fast do you reply?",
    a: "Usually within 24 hours on working days. Partnership queries can take a little longer."
  }
];

function Letters({ text, gradFrom }) {
  return text.split("").map((c, i) => (
    <span
      key={i}
      className={`lt ${i >= gradFrom ? "grad" : ""}`}
      style={{ animationDelay: `${i * 0.06}s, ${0.7 + i * 0.15}s, 0s` }}
    >
      {c === " " ? " " : c}
    </span>
  ));
}

export default function ContactView() {
  const [topic, setTopic] = useState("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — humans never see it
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, name, email, message, company })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send your message. Try again.");
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="hero contact-hero">
        <h1 className="hero-title" aria-label="Let's talk">
          <Letters text="Let's talk" gradFrom={6} />
        </h1>
        <p>Questions, ideas, partnerships — a real human reads every message.</p>
        <span className="contact-pill">⚡ Usually replies within 24 hours</span>
      </div>

      <div className="container contact-wrap">
        <div className="contact-topics">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`contact-topic ${topic === t.id ? "active" : ""}`}
              onClick={() => {
                setTopic(t.id);
                document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <span className="ct-icon">{t.icon}</span>
              <span className="ct-title">{t.title}</span>
              <span className="ct-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        {sent ? (
          <div className="contact-card contact-success" id="contact-form">
            <svg viewBox="0 0 64 64" className="success-mark" aria-hidden="true">
              <circle cx="32" cy="32" r="28" className="sm-circle" />
              <path d="M20 33.5 L28.5 42 L45 24" className="sm-check" />
            </svg>
            <h2>Message sent!</h2>
            <p>
              Thanks{name ? `, ${name.split(" ")[0]}` : ""} — we&apos;ve got it and we&apos;ll reply to{" "}
              <strong>{email}</strong> soon.
            </p>
            <button
              type="button"
              className="contact-send"
              onClick={() => {
                setSent(false);
                setMessage("");
              }}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form className="contact-card" id="contact-form" onSubmit={submit}>
            <div className="contact-row">
              <label className="float-field">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  required
                  maxLength={80}
                />
                <span>Your name</span>
              </label>
              <label className="float-field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  maxLength={120}
                />
                <span>Email address</span>
              </label>
            </div>

            <label className="float-field">
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.title}
                  </option>
                ))}
              </select>
              <span>Topic</span>
            </label>

            <label className="float-field">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder=" "
                required
                minLength={10}
                maxLength={2000}
                rows={6}
              />
              <span>Your message</span>
            </label>

            {/* honeypot — bots fill it, humans never see it */}
            <input
              type="text"
              className="hp-field"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-hidden="true"
            />

            {error && <p className="contact-error">{error}</p>}

            <button type="submit" className="contact-send" disabled={sending}>
              {sending ? <span className="spinner" /> : "Send message →"}
            </button>
          </form>
        )}

        <div className="contact-faq">
          <h2>
            Quick <span className="grad-text">answers</span>
          </h2>
          {FAQS.map((f, i) => (
            <details key={i} className="faq-item">
              <summary>
                {f.q}
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
