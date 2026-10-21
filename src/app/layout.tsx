import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { SampleBanner } from "@/components/SampleBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TourTix",
  description: "Track your favorite artists' tours and find the cheapest tickets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <SampleBanner />
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Tour<span className="text-violet-600">Tix</span>
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
