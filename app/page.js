import SearchApp from "../components/SearchApp";
import TopNav from "../components/TopNav";
import AnimatedTitle from "../components/AnimatedTitle";

export default function Home() {
  return (
    <main>
      <TopNav />
      <div className="hero">
        <div className="hero-badge">✦ AI-powered image discovery</div>
        <AnimatedTitle />
        <p>Millions of free, high-quality images — one search.</p>
      </div>
      <div className="container">
        <SearchApp />
      </div>
      <footer>
        Images belong to their respective photographers and platforms. OneSearch is an aggregator —
        always follow each platform&apos;s license. · <a href="/privacy">Privacy Policy</a> ·{" "}
        <a href="/contact">Contact</a>
      </footer>
    </main>
  );
}
