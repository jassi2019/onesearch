export default function VideoBanner() {
  return (
    <a
      className="vb"
      href="https://aurawells-live.web.app"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open AuraWalls — Video Wallpaper Studio"
    >
      <span className="vb-orb vb-orb1" aria-hidden="true" />
      <span className="vb-orb vb-orb2" aria-hidden="true" />
      <span className="vb-orb vb-orb3" aria-hidden="true" />
      <span className="vb-shine" aria-hidden="true" />

      <span className="vb-play" aria-hidden="true">
        <span className="vb-ring" />
        <span className="vb-ring vb-ring2" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.14v13.72c0 .9.98 1.46 1.76.99l11-6.86a1.17 1.17 0 0 0 0-1.98l-11-6.86A1.17 1.17 0 0 0 8 5.14Z" />
        </svg>
      </span>

      <span className="vb-text">
        <span className="vb-kicker">🎬 Video · by the makers of OneSearch</span>
        <strong className="vb-title">
          Still images done? Make your screen <em>move</em>
        </strong>
        <span className="vb-sub">
          AuraWalls — cinematic video wallpapers that bring desktops &amp; phones to life.
        </span>
      </span>

      <span className="vb-cta">
        Open AuraWalls
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>
    </a>
  );
}
