import AnimatedTitle from "./AnimatedTitle";

const FEATURES = [
  {
    icon: "🔍",
    title: "5 libraries, one search",
    desc: "Search millions of free stock photos, illustrations and vectors from five image libraries at once — no more tab hopping."
  },
  {
    icon: "⬇️",
    title: "HD & Ultra downloads",
    desc: "Pick Low, High or Ultra quality and download images in the exact resolution you need, including social-media-ready crops."
  },
  {
    icon: "🎙️",
    title: "Voice search",
    desc: "Tap the mic and say what you're looking for — perfect for quick searches on your phone."
  },
  {
    icon: "😀",
    title: "Emoji Studio",
    desc: "A full emoji library plus a creator for custom animated emojis — export PNG, SVG, GIF or video for your reels and videos."
  },
  {
    icon: "🧑‍🎨",
    title: "Creator pages",
    desc: "Upload your own photography, build a following, and get automatic watermark protection on every image."
  },
  {
    icon: "🛡️",
    title: "Safe & clean",
    desc: "Strict safe-search on every source, AI-generated uploads blocked, and commercial-use filters so you stay license-safe."
  }
];

const FAQS = [
  {
    q: "Is OneSearch free to use?",
    a: "Yes. Create a free account and start searching millions of free stock images instantly. Paid plans add more volume and team features."
  },
  {
    q: "Where do the images come from?",
    a: "OneSearch aggregates several trusted free stock photo libraries and independent creators into a single search, so you see the best results from everywhere at once."
  },
  {
    q: "Can I use the images commercially?",
    a: "Most images are free for commercial use. Use the “Commercial use ✓” filter to only see images cleared for business projects, and check the license on download."
  },
  {
    q: "Does OneSearch work on mobile?",
    a: "Yes — OneSearch installs as a full-screen app on iPhone and Android straight from the browser. Open the site and tap “Add to Home Screen”."
  },
  {
    q: "How do I become a creator?",
    a: "Sign up, switch your profile to a Business (creator) account, accept the Creator Terms, and start uploading. Every upload gets your personal watermark automatically."
  }
];

export default function Landing() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "OneSearch",
        url: "https://onesearch-lm.vercel.app",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web, iOS, Android",
        description:
          "OneSearch is a free stock image search engine that searches millions of photos, illustrations and vectors from multiple libraries at once, with HD downloads, voice search and an emoji studio.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      }
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
          <a href="/pricing">Pricing</a>
          <a href="/contact" className="nav-contact">
            <span className="nc-text">Contact</span>
          </a>
          <a href="/login">Log in</a>
          <a href="/signup" className="nav-cta">
            Sign up free
          </a>
        </div>
      </nav>

      <div className="hero landing-hero">
        <div className="hero-badge">✦ AI-powered image discovery</div>
        <AnimatedTitle />
        <p>
          One search across millions of <strong>free stock photos</strong>, illustrations and
          vectors — from five image libraries and real creators, in HD.
        </p>
        <div className="landing-cta">
          <a className="plan-cta" href="/signup">
            Start searching free →
          </a>
          <a className="landing-ghost" href="/login">
            I have an account
          </a>
        </div>
        <p className="landing-trust">Free forever plan · No credit card · Works on iPhone & Android</p>
      </div>

      <div className="container">
        <div className="landing-stats">
          <div>
            <strong>5</strong>
            <span>image libraries</span>
          </div>
          <div>
            <strong>1M+</strong>
            <span>free images</span>
          </div>
          <div>
            <strong>3</strong>
            <span>quality levels</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>safe search</span>
          </div>
        </div>

        <h2 className="landing-h2">
          Everything you need to <span className="grad-text">find the perfect image</span>
        </h2>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat-card" key={f.title}>
              <span className="feat-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="landing-h2">
          How it <span className="grad-text">works</span>
        </h2>
        <div className="steps-row">
          <div className="step-card">
            <span className="step-num">1</span>
            <h3>Create a free account</h3>
            <p>Sign up with email or Google in seconds.</p>
          </div>
          <div className="step-card">
            <span className="step-num">2</span>
            <h3>Search everything at once</h3>
            <p>Type or speak your search — filter by color, orientation, license and more.</p>
          </div>
          <div className="step-card">
            <span className="step-num">3</span>
            <h3>Download in HD</h3>
            <p>Grab the exact size you need, or save images to your collections.</p>
          </div>
        </div>

        <h2 className="landing-h2">
          Questions, <span className="grad-text">answered</span>
        </h2>
        <div className="contact-faq landing-faq">
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

        <div className="landing-band">
          <h2>Ready to find your next image?</h2>
          <p>Join OneSearch free and search five image libraries in one place.</p>
          <a className="plan-cta" href="/signup">
            Create free account →
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
