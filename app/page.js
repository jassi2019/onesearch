import SearchApp from "../components/SearchApp";
import TopNav from "../components/TopNav";

export default function Home() {
  return (
    <main>
      <TopNav />
      <div className="hero">
        <div className="hero-badge">✦ AI-powered image discovery</div>
        <h1>
          One<span>Search</span>
        </h1>
        <p>Millions of free, high-quality images — one search.</p>
      </div>
      <div className="container">
        <SearchApp />
      </div>
      <footer>
        Images belong to their respective photographers and platforms. OneSearch is an aggregator —
        always follow each platform&apos;s license. · <a href="/privacy">Privacy Policy</a>
      </footer>
    </main>
  );
}
