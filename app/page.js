import SearchApp from "../components/SearchApp";

export default function Home() {
  return (
    <main>
      <nav className="topnav">
        <a href="/collections">Collections</a>
        <a href="/pricing">Pricing</a>
      </nav>
      <div className="hero">
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
