import "./globals.css";

import { TelemetryProvider } from "@/components/TelemetryProvider";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { PUBLISHER_NAME } from "@/lib/contact";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import type { Metadata, Viewport } from "next";


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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rename.bimcheck-consulting.com";
const appTitle = "BIMCHECK-Rename — Convention de nommage multi-métiers";
const appDescription =
  "Standardisez les noms de fichiers de votre équipe — BIM, juridique, finance, RH, santé, industrie, immobilier. Local-first : aucun upload, tout reste dans le navigateur.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appTitle,
    template: "%s — BIMCHECK-Rename",
  },
  description: appDescription,
  applicationName: "BIMCHECK-Rename",
  authors: [{ name: PUBLISHER_NAME }],
  creator: PUBLISHER_NAME,
  publisher: "BIMCHECK-Rename",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "BIMCHECK-Rename",
    title: appTitle,
    description: appDescription,
  },
  twitter: {
    card: "summary_large_image",
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
  themeColor: "#0A0F1E",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <ConvexClientProvider>
      <TelemetryProvider>{children}</TelemetryProvider>
    </ConvexClientProvider>
  );
  const hasConvex = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL?.trim());

  return (
    <html
      lang="fr"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <head>
        {/* Early theme script — runs before React hydration to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: earlyThemeScript }} />
      </head>
      <body>
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-lg transition focus:translate-y-0"
        >
          Aller au contenu principal
        </a>
        <div id="main-content" tabIndex={-1}>
          {hasConvex ? (
            <ConvexAuthNextjsServerProvider>{content}</ConvexAuthNextjsServerProvider>
          ) : (
            content
          )}
        </div>
      </body>
    </html>
  );
}
