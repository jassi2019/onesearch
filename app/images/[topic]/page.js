import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS, getTopic, relatedTopics } from "../../../lib/topics";
import { aggregateSearch } from "../../../lib/aggregate";

const BASE = "https://onesearch-lm.vercel.app";

// Refresh the image grid once a day
export const revalidate = 86400;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.slug }));
}

export function generateMetadata({ params }) {
  const t = getTopic(params.topic);
  if (!t) return {};
  return {
    title: `${t.title} | OneSearch`,
    description: t.desc,
    alternates: { canonical: `${BASE}/images/${t.slug}` },
    openGraph: {
      title: t.title,
      description: t.desc,
      url: `${BASE}/images/${t.slug}`,
      images: ["/og.png"]
    }
  };
}

async function fetchImages(query) {
  try {
    const data = await aggregateSearch({
      query,
      sources: [],
      page: 1,
      perPage: 6
    });
    return (data.results || []).slice(0, 12);
  } catch {
    return [];
  }
}

export default async function TopicPage({ params }) {
  const t = getTopic(params.topic);
  if (!t) notFound();

  const images = await fetchImages(t.query);
  const related = relatedTopics(t.slug, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "OneSearch", item: BASE },
          { "@type": "ListItem", position: 2, name: "Free Images", item: `${BASE}/images` },
          { "@type": "ListItem", position: 3, name: t.name, item: `${BASE}/images/${t.slug}` }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      },
      ...(images.length
        ? [
            {
              "@type": "ImageGallery",
              name: t.title,
              url: `${BASE}/images/${t.slug}`,
              image: images.slice(0, 6).map((img) => ({
                "@type": "ImageObject",
                contentUrl: img.thumb,
                name: img.alt || t.name,
                creator: img.photographer
                  ? { "@type": "Person", name: img.photographer }
                  : undefined
              }))
            }
          ]
        : [])
    ]
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
          <a href="/images">Free Images</a>
          <a href="/pricing">Pricing</a>
          <a href="/login">Log in</a>
          <a href="/signup" className="nav-cta">
            Sign up free
          </a>
        </div>
      </nav>

      <div className="hero">
        <p className="crumbs">
          <Link href="/">Home</Link> › <Link href="/images">Free Images</Link> ›{" "}
          <span>{t.name}</span>
        </p>
        <h1>
          Free <span>{t.name}</span> Images
        </h1>
        <p>{t.intro}</p>
        <div className="landing-cta">
          <a className="plan-cta" href={`/signup`}>
            Search {t.name.toLowerCase()} images free →
          </a>
        </div>
      </div>

      <div className="container">
        {images.length > 0 && (
          <>
            <div className="seo-grid">
              {images.map((img) => (
                <a className="seo-card" key={img.id} href="/signup" title={`Download: ${img.alt || t.name}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.thumb} alt={img.alt || `Free ${t.name} image`} loading="lazy" />
                  {img.photographer && <span className="seo-credit">📷 {img.photographer}</span>}
                </a>
              ))}
            </div>
            <p className="seo-note">
              A small live preview — sign up free to search thousands more {t.name.toLowerCase()}{" "}
              images across five libraries, filter by color and orientation, and download in HD.
            </p>
          </>
        )}

        <h2 className="landing-h2">
          Perfect <span className="grad-text">for</span>
        </h2>
        <ul className="seo-uses">
          {t.uses.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>

        <h2 className="landing-h2">
          Questions, <span className="grad-text">answered</span>
        </h2>
        <div className="contact-faq landing-faq">
          {t.faqs.map((f, i) => (
            <details key={i} className="faq-item">
              <summary>
                {f.q}
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <h2 className="landing-h2">
          Related <span className="grad-text">searches</span>
        </h2>
        <div className="seo-related">
          {related.map((r) => (
            <Link className="chip" key={r.slug} href={`/images/${r.slug}`}>
              {r.emoji} {r.name}
            </Link>
          ))}
        </div>

        <div className="landing-band">
          <h2>Find the perfect {t.name.toLowerCase()} image</h2>
          <p>
            One free account. Five image libraries. HD downloads with color, orientation and
            license filters.
          </p>
          <a className="plan-cta" href="/signup">
            Create free account →
          </a>
        </div>
      </div>

      <footer>
        Images belong to their respective photographers and platforms. OneSearch is an aggregator —
        always follow each platform&apos;s license. · <a href="/images">Free Images</a> ·{" "}
        <a href="/pricing">Pricing</a> · <a href="/trends">Trend Calendar</a> ·{" "}
        <a href="/privacy">Privacy Policy</a> · <a href="/contact">Contact</a>
      </footer>
    </main>
  );
}
