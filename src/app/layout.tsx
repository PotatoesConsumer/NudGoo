/* eslint-disable @next/next/no-page-custom-font --
   The design relies on the exact families Trirong/Sarabun/Noto Sans Thai/Inter
   by name; loading them once here in the root layout head applies them app-wide. */
import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { env } from "@/lib/env";

import "./globals.css";

const PHOSPHOR = "https://unpkg.com/@phosphor-icons/web@2.1.1/src";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  applicationName: "NudGoo",
  title: "NudGoo — let's meet up",
  description:
    "Plans, polls & group chaos — sorted. Group chat, trip voting, bill splitting and games for your gang.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "NudGoo" },
  icons: {
    icon: { url: "/icons/icon.svg", type: "image/svg+xml" },
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b5bdb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Design fonts — the exact families the mockup uses. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Trirong:wght@500;600;700&family=Sarabun:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
        {/* Phosphor icons — same `ph ph-*` classes the design references. */}
        <link rel="stylesheet" href={`${PHOSPHOR}/regular/style.css`} />
        <link rel="stylesheet" href={`${PHOSPHOR}/bold/style.css`} />
        <link rel="stylesheet" href={`${PHOSPHOR}/fill/style.css`} />
        <link rel="stylesheet" href={`${PHOSPHOR}/duotone/style.css`} />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
