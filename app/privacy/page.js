export const metadata = {
  title: "Privacy Policy — OneSearch",
  description: "Privacy policy for the OneSearch image search aggregator."
};

export default function PrivacyPolicy() {
  return (
    <main className="container" style={{ maxWidth: 760, paddingTop: 48 }}>
      <h1 style={{ marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "var(--muted)", marginBottom: 32 }}>Last updated: November 10, 2026</p>

      <section style={{ display: "grid", gap: 20, lineHeight: 1.7 }}>
        <p>
          OneSearch (&quot;we&quot;, &quot;our&quot;) is an image search aggregator operated by
          CLICKSEMRUS. This policy explains what data we handle when you use this site.
        </p>

        <h2>What we collect</h2>
        <p>
          <strong>Search queries.</strong> When you search, your query is forwarded to third-party
          image platforms (Openverse, Unsplash, Pexels, Pixabay, Pinterest) through their official
          APIs to fetch results. Queries are not linked to your identity.
        </p>
        <p>
          <strong>No accounts, no tracking.</strong> We do not require registration, do not set
          advertising or analytics cookies, and do not sell or share personal data.
        </p>
        <p>
          <strong>Voice search.</strong> If you use the microphone button, speech recognition is
          performed by your own browser (Web Speech API). We never receive or store your audio;
          only the resulting text query is used for the search.
        </p>
        <p>
          <strong>Server logs.</strong> Our hosting provider (Vercel) may keep standard technical
          logs (IP address, user agent, timestamps) for security and operations.
        </p>

        <h2>Third-party platforms</h2>
        <p>
          Search results, images and links come from third-party platforms and remain subject to
          their own terms and privacy policies. When you open an image&apos;s source page, you leave
          this site.
        </p>

        <h2>Data retention</h2>
        <p>
          We store no user profiles or search history on our servers. API responses may be cached
          briefly (minutes) to reduce load on the source platforms.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions, contact:{" "}
          <a href="mailto:lakshay.mehra@salarytopup.com">lakshay.mehra@salarytopup.com</a>
        </p>
      </section>

      <p style={{ marginTop: 40 }}>
        <a href="/" style={{ color: "var(--accent)" }}>← Back to OneSearch</a>
      </p>
    </main>
  );
}
