import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Shoraj Tomer - Educator, Storyteller & Content Creator",
  description: "Welcome to my digital space where I share knowledge through blogs, stories, courses, and workshops. Join me on this journey of learning and creativity.",
  keywords: ["education", "storytelling", "content creation", "courses", "workshops", "blog", "Shoraj Tomer"],
  authors: [{ name: "Shoraj Tomer", url: "https://shorajtomer.me" }],
  creator: "Shoraj Tomer",
  publisher: "Shoraj Tomer",
  metadataBase: new URL("https://shorajtomer.me"),
  alternates: {
    canonical: "https://shorajtomer.me",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shorajtomer.me",
    siteName: "Shoraj Tomer",
    title: "Shoraj Tomer - Educator, Storyteller & Content Creator",
    description: "Welcome to my digital space where I share knowledge through blogs, stories, courses, and workshops. Join me on this journey of learning and creativity.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shoraj Tomer - Educator, Storyteller & Content Creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@shorajtomer",
    creator: "@shorajtomer",
    title: "Shoraj Tomer - Educator, Storyteller & Content Creator",
    description: "Welcome to my digital space where I share knowledge through blogs, stories, courses, and workshops.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
