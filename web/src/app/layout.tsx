import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendSight — Privacy-first Spend Analyzer",
  description:
    "Analyze bank and card statements locally with SpendSight. No uploads, no storage, optional AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 text-sm">
            <Link href="/" className="font-semibold">
              SpendSight
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="text-muted-foreground hover:text-foreground"
              >
                Settings
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
