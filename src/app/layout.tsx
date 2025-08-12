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
  keywords: ["education", "storytelling", "content creation", "courses", "workshops", "blog"],
  authors: [{ name: "Shoraj Tomer" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: "Shoraj Tomer - Educator, Storyteller & Content Creator",
    description: "Welcome to my digital space where I share knowledge through blogs, stories, courses, and workshops.",
    siteName: "Shoraj Tomer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shoraj Tomer - Educator, Storyteller & Content Creator",
    description: "Welcome to my digital space where I share knowledge through blogs, stories, courses, and workshops.",
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
