import TopNav from "../../components/TopNav";
import { upcomingEvents, EVERGREEN } from "../../lib/trends";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Image Trend Calendar — OneSearch",
  description:
    "What to post next: upcoming festivals, sale events and seasonal moments with ready-made free stock image searches for marketers and creators."
};

const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

function daysLabel(n) {
  if (n === 0) return "Today!";
  if (n === 1) return "Tomorrow";
  return `in ${n} days`;
}

export default function TrendsPage() {
  const events = upcomingEvents(90);

  return (
    <main>
      <TopNav />
      <div className="hero">
        <div className="hero-badge">📅 Plan your content ahead</div>
        <h1>
          Trend <span>Calendar</span>
        </h1>
        <p>Upcoming moments marketers should be posting about — with ready image searches.</p>
      </div>

      <div className="container trends-wrap">
        <div className="trend-grid">
          {events.map((ev) => (
            <div className={`trend-card ${ev.daysLeft <= 7 ? "soon" : ""}`} key={ev.name}>
              <div className="trend-head">
                <span className="trend-emoji">{ev.emoji}</span>
                <div>
                  <h3>{ev.name}</h3>
                  <p>
                    {fmt.format(ev.date)} · <strong>{daysLabel(ev.daysLeft)}</strong>
                  </p>
                </div>
              </div>
              <div className="trend-queries">
                {ev.queries.map((q) => (
                  <a className="chip" key={q} href={`/?q=${encodeURIComponent(q)}`}>
                    {q}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className="landing-h2">
          Evergreen <span className="grad-text">searches</span>
        </h2>
        <div className="suggestions trend-evergreen">
          {EVERGREEN.map((q) => (
            <a className="chip" key={q} href={`/?q=${encodeURIComponent(q)}`}>
              {q}
            </a>
          ))}
        </div>
      </div>

      <footer>
        <a href="/">← Back to search</a> · <a href="/privacy">Privacy Policy</a> ·{" "}
        <a href="/contact">Contact</a>
      </footer>
    </main>
  );
}
