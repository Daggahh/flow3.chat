import { Metadata } from "next";

const siteConfig = {
  name: "Flow3",
  description:
    "A sophisticated, real-time chat application with multi-model AI integration, secure authentication, and elegant user interface.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  author: "Daggahhh",
  twitter: "@bouffdaddy_",
};

export const metadata: Metadata = {
  title: `${siteConfig.name} - Advanced AI Chat Interface`,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  keywords: [
    "AI Chat",
    "OpenAI",
    "Anthropic",
    "Google AI",
    "Next.js",
    "Supabase",
    "Real-time Chat",
  ],
  authors: [
    {
      name: siteConfig.author,
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} - Advanced AI Chat Interface`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Advanced AI Chat Interface`,
    description: siteConfig.description,
    creator: siteConfig.twitter,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
  robots: {
    index: true,
    follow: true,
  },
};
