import "./globals.css";

export const metadata = {
  title: "OneSearch — Image Search Aggregator",
  description: "Search Unsplash, Pexels and Pixabay from one place."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
