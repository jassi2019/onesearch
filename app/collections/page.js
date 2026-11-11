import CollectionsView from "../../components/CollectionsView";

export const metadata = {
  title: "Collections — OneSearch",
  description: "Your saved image boards."
};

export default function CollectionsPage() {
  return (
    <main>
      <nav className="topnav">
        <a href="/">Search</a>
        <a href="/pricing">Pricing</a>
      </nav>
      <div className="hero">
        <h1>
          My <span>Collections</span>
        </h1>
        <p>Boards are saved in this browser. Cloud sync arrives with accounts.</p>
      </div>
      <div className="container">
        <CollectionsView />
      </div>
      <footer>
        <a href="/">← Back to search</a> · <a href="/privacy">Privacy Policy</a>
      </footer>
    </main>
  );
}
