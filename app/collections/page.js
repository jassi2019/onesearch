import CollectionsView from "../../components/CollectionsView";
import TopNav from "../../components/TopNav";

export const metadata = {
  title: "Collections — OneSearch",
  description: "Your saved image boards."
};

export default function CollectionsPage() {
  return (
    <main>
      <TopNav />
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
        <a href="/">← Back to search</a> · <a href="/privacy">Privacy Policy</a> ·{" "}
        <a href="/contact">Contact</a>
      </footer>
    </main>
  );
}
