import PricingPlans from "../../components/PricingPlans";
import TopNav from "../../components/TopNav";

export const metadata = {
  title: "Pricing — OneSearch",
  description: "OneSearch plans: Free, Pro and Team."
};

export default function PricingPage() {
  return (
    <main>
      <TopNav />
      <div className="hero">
        <h1>
          Simple <span>pricing</span>
        </h1>
        <p>Start free. Upgrade when you need more sources, searches and team features.</p>
      </div>
      <div className="container">
        <PricingPlans />
        <p className="pricing-note">
          🚧 Demo mode — payments are not live yet. Plans and prices are indicative.
        </p>
      </div>
      <footer>
        <a href="/">← Back to search</a> · <a href="/privacy">Privacy Policy</a>
      </footer>
    </main>
  );
}
