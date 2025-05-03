import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/globals.css";
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import Loading from './loading';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Sports Orthopedics Institute | Excellence in Motion",
    template: "%s | Sports Orthopedics Institute"
  },
  description: "Sports Orthopedics Institute offers specialized orthopedic care for sports injuries, joint reconstruction, and comprehensive treatment of musculoskeletal conditions.",
  keywords: ["orthopedics", "sports medicine", "joint reconstruction", "bone", "joint", "surgery", "knee", "shoulder", "hip", "treatment"],
  authors: [{ name: "Sports Orthopedics Institute", url: "https://fordoc-production.up.railway.app" }],
  creator: "Sports Orthopedics Institute",
  publisher: "Sports Orthopedics Institute",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fordoc-production.up.railway.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sports Orthopedics Institute | Excellence in Motion",
    description: "Specialized orthopedic care for sports injuries, joint reconstruction, and treatment of musculoskeletal conditions.",
    url: "https://fordoc-production.up.railway.app",
    siteName: "Sports Orthopedics Institute",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sports Orthopedics Institute",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Orthopedics Institute | Excellence in Motion",
    description: "Specialized orthopedic care for sports injuries, joint reconstruction, and treatment of musculoskeletal conditions.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg" }
    ],
    shortcut: { url: "/favicon.svg" },
    apple: { url: "/logo.jpg" }
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#8B5C9E" },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
        <main suppressHydrationWarning>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </body>
    </html>
  );
}
