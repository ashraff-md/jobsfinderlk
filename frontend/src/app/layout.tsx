import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SiteChrome } from "@/components/layout/site-chrome";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "JobsFinder.lk — Executive AI Talent Matching",
    template: "%s | JobsFinder.lk",
  },
  description:
    "The easiest and smartest way for Sri Lankans to find jobs and for companies to hire talent.",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full scroll-smooth antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full bg-background text-on-surface font-sans selection:bg-primary/10">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
