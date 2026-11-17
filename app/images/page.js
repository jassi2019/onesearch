import Link from "next/link";
import { TOPIC_GROUPS, TOPICS } from "../../lib/topics";

const BASE = "https://onesearch-lm.vercel.app";

export const metadata = {
  title: "Free Stock Images by Category — Festivals, Backgrounds & More | OneSearch",
  description:
    "Browse free stock images by category — Diwali, Holi, birthdays, backgrounds, nature, business and more. HD downloads from five libraries in one search.",
  alternates: { canonical: `${BASE}/images` }
};

export default function ImagesIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free Stock Images by Category",
    url: `${BASE}/images`,
    hasPart: TOPICS.map((t) => ({
      "@type": "WebPage",
      name: t.title,
      url: `${BASE}/images/${t.slug}`
    }))
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="topnav">
        <a className="brand" href="/">
          One<span>Search</span>
        </a>
        <div className="nav-links">
          <a href="/pricing">Pricing</a>
          <a href="/login">Log in</a>
          <a href="/signup" className="nav-cta">
            Sign up free
          </a>
        </div>
      </nav>

      <div className="hero">
        <h1>
          Free Images by <span>Category</span>
        </h1>
        <p>
          Hand-picked collections of free stock photos — festivals, wishes, backgrounds, nature and
          business. Every category searches five image libraries at once, with HD downloads.
        </p>
      </div>

      <div className="container">
        {TOPIC_GROUPS.map((g) => (
          <section key={g.group} className="seo-group">
            <h2 className="landing-h2">
              {g.emoji} <span className="grad-text">{g.group}</span>
            </h2>
            <div className="seo-related">
              {g.topics.map((t) => (
                <Link className="chip" key={t.slug} href={`/images/${t.slug}`}>
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="landing-band">
          <h2>Can&apos;t find your topic?</h2>
          <p>Sign up free and search anything — five libraries, millions of images, one search bar.</p>
          <a className="plan-cta" href="/signup">
            Start searching free →
          </a>
        </div>
      </div>

      <footer>
        Images belong to their respective photographers and platforms. OneSearch is an aggregator —
        always follow each platform&apos;s license. · <a href="/pricing">Pricing</a> ·{" "}
        <a href="/trends">Trend Calendar</a> · <a href="/privacy">Privacy Policy</a> ·{" "}
        <a href="/contact">Contact</a>
      </footer>
    </main>
  );
}
