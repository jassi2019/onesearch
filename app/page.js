import SearchApp from "../components/SearchApp";

export default function Home() {
  return (
    <main>
      <div className="hero">
        <h1>
          One<span>Search</span>
        </h1>
        <p>Search Unsplash, Pexels and Pixabay — one query, every platform.</p>
      </div>
      <div className="container">
        <SearchApp />
      </div>
      <footer>
        Images belong to their respective photographers and platforms. OneSearch is an aggregator —
        always follow each platform&apos;s license.
      </footer>
    </main>
  );
}
