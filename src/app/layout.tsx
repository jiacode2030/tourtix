import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/Header";
import { SampleBanner } from "@/components/SampleBanner";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "TourTix: never miss a ticket drop", template: "%s | TourTix" },
  description:
    "Track your favorite artists' tour dates, get alerts when presales and on-sales start, and compare where to buy tickets. Free.",
  openGraph: { siteName: "TourTix", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* impact.com (Vivid Seats affiliate) site ownership verification.
            impact.com's tag uses `value` rather than the usual `content`. */}
        <meta
          name="impact-site-verification"
          {...{ value: "6c44ae7a-96d9-432a-bad2-05701b1b8f64" }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <SampleBanner />
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
