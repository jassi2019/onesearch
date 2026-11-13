import { cookies } from "next/headers";
import SearchApp from "../components/SearchApp";
import TopNav from "../components/TopNav";
import AnimatedTitle from "../components/AnimatedTitle";
import Landing from "../components/Landing";
import { verifyToken, SESSION_COOKIE } from "../lib/auth";

export default function Home() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const loggedIn = token ? Boolean(verifyToken(token)) : false;

  // Logged-out visitors (and search engines) get the public landing page;
  // the search app itself stays behind login.
  if (!loggedIn) return <Landing />;

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
