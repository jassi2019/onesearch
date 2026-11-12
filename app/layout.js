import { Outfit, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-2EHYDC2XZV";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-head", weight: ["500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "OneSearch — Image Search Aggregator",
  description: "Search millions of free, high-quality images from one place."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <div className="bg-fx" aria-hidden="true">
          <div className="aurora" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="bg-grid" />
        </div>
        {children}
      </body>
    </html>
  );
}
