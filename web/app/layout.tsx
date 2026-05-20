import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { TelemetryProvider } from "@/components/TelemetryProvider";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bimdoc-renamer.vercel.app";
const appTitle = "BimDoc Renamer — Renommer vos livrables BIM avant dépôt CDE";
const appDescription =
  "Outil local-first pour appliquer une convention de nommage ISO 19650 ou SIA 2051 à vos lots de plans, IFC, DWG, PDF. Aucun upload : tout reste dans votre navigateur. Compatible Autodesk Docs, Trimble Connect, Kroqi.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appTitle,
    template: "%s — BimDoc Renamer",
  },
  description: appDescription,
  applicationName: "BimDoc Renamer",
  authors: [{ name: "Jawani Fernandes" }],
  creator: "Jawani Fernandes",
  publisher: "BimDoc Renamer",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "BimDoc Renamer",
    title: appTitle,
    description: appDescription,
  },
  twitter: {
    card: "summary",
    title: appTitle,
    description: appDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: "#F8F6F1",
  colorScheme: "light dark",
};

/**
 * Inline script that runs before React hydration to set the correct
 * data-theme attribute on <html>, preventing a flash of wrong theme.
 * Uses the same localStorage key as lib/theme.ts (bim_theme).
 * Only relevant for /app subtree but harmless on landing.
 */
const earlyThemeScript = `
(function() {
  try {
    var stored = localStorage.getItem('bim_theme');
    var resolved = 'light';
    if (stored === 'dark') {
      resolved = 'dark';
    } else if (stored === 'system' || !stored) {
      resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
  } catch(e) {}
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <head>
        {/* Early theme script — runs before React hydration to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: earlyThemeScript }} />
        <link rel="prefetch" href="/pdf.worker.min.mjs" as="script" />
      </head>
      <body>
        <TelemetryProvider>{children}</TelemetryProvider>
      </body>
    </html>
  );
}
