import ProfileForm from "../../components/ProfileForm";
import TopNav from "../../components/TopNav";

export const metadata = { title: "My Profile — OneSearch" };

export default function ProfilePage() {
  return (
    <main>
      <TopNav />
      <div className="hero">
        <h1>
          My <span>Profile</span>
        </h1>
        <p>Manage your account, photo and saved content.</p>
      </div>
      <div className="container">
        <ProfileForm />
      </div>
    </main>
  );
}
