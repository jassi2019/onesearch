import UserPage from "../../../components/UserPage";
import TopNav from "../../../components/TopNav";

export const metadata = { title: "Creator Page — OneSearch" };

export default function CreatorPage({ params }) {
  return (
    <main>
      <TopNav />
      <div className="container" style={{ paddingTop: 36 }}>
        <UserPage pageId={params.id} />
      </div>
    </main>
  );
}
