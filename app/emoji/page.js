import EmojiStudio from "../../components/EmojiStudio";
import TopNav from "../../components/TopNav";

export const metadata = {
  title: "Emoji Studio — OneSearch",
  description: "Browse every emoji and create your own custom emoji."
};

export default function EmojiPage() {
  return (
    <main>
      <TopNav />
      <div className="hero">
        <h1>
          Emoji <span>Studio</span>
        </h1>
        <p>Every emoji in one place — copy, download, or design your own.</p>
      </div>
      <div className="container">
        <EmojiStudio />
      </div>
    </main>
  );
}
