import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prochecka.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prochecka - AI-Powered Diabetes Prevention & Health Assistant",
    template: "%s | Prochecka"
  },
  description: "Get instant diabetes risk assessment with Prochecka's AI-powered chatbot. Personalized meal plans, exercise routines, and health management for Type 2 diabetes prevention in Africa.",
  keywords: [
    "diabetes prevention",
    "diabetes risk assessment",
    "PIMA diabetes test",
    "AI health assistant",
    "Type 2 diabetes",
    "diabetes management Africa",
    "personalized meal plans",
    "exercise routines",
    "health chatbot",
    "diabetes screening",
    "African diet plans",
    "diabetes risk calculator"
  ],
  authors: [{ name: "Prochecka Team" }],
  creator: "Prochecka",
  publisher: "Prochecka",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Prochecka",
    title: "Prochecka - AI-Powered Diabetes Prevention & Health Assistant",
    description: "Get instant diabetes risk assessment with AI-powered personalized meal plans and exercise routines. Free PIMA diabetes test in under 5 minutes.",
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Prochecka - AI Diabetes Prevention Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prochecka - AI-Powered Diabetes Prevention",
    description: "Free diabetes risk assessment with personalized health plans. AI-powered chatbot for Type 2 diabetes prevention.",
    images: [`${siteUrl}/images/og-image.png`],
    creator: "@prochecka",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
