import TopNav from "../../components/TopNav";
import ContactView from "../../components/ContactView";

export const metadata = {
  title: "Contact — OneSearch",
  description: "Questions, partnerships or feedback — talk to the OneSearch team."
};

export default function ContactPage() {
  return (
    <main>
      <TopNav />
      <ContactView />
      <footer>
        <a href="/">← Back to search</a> · <a href="/privacy">Privacy Policy</a>
      </footer>
    </main>
  );
}
