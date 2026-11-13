export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/collections", "/u/", "/emoji", "/creators"]
      }
    ],
    sitemap: "https://onesearch-lm.vercel.app/sitemap.xml"
  };
}
