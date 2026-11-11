export default function TopNav() {
  return (
    <nav className="topnav">
      <a className="brand" href="/">
        One<span>Search</span>
      </a>
      <div className="nav-links">
        <a href="/collections">Collections</a>
        <a href="/pricing">Pricing</a>
      </div>
    </nav>
  );
}
