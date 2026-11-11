import CreatorsList from "../../components/CreatorsList";
import TopNav from "../../components/TopNav";

export const metadata = { title: "Creators — OneSearch" };

export default function CreatorsPage() {
  return (
    <main>
      <TopNav />
      <div className="hero">
        <h1>
          Discover <span>Creators</span>
        </h1>
        <p>Follow creators and explore their uploaded work.</p>
      </div>
      <div className="container">
        <CreatorsList />
      </div>
    </main>
  );
}
