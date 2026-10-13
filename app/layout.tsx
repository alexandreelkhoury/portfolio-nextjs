import type { Metadata, Viewport } from "next"; // Import Viewport type
import { Orbitron, Exo_2, Geist_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alexandre El-Khoury | Software & Blockchain Engineer",
  description: "Alexandre El-Khoury, software and blockchain engineer in Beirut. Mathematics at Université de Paris, a Master of Blockchain Engineering at ESGI, and products shipped from smart contracts to mobile apps.",
  keywords: ["blockchain developer", "solidity", "web3", "DeFi", "smart contracts", "full-stack developer", "react", "next.js", "ethereum", "solana"],
  authors: [{ name: "Alexandre El-Khoury" }],
  creator: "Alexandre El-Khoury",
  metadataBase: new URL("https://portfolio-nextjs--portfolio-software-engineer.europe-west4.hosted.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    title: "Alexandre El-Khoury | Software & Blockchain Engineer",
    description: "Software and blockchain engineer in Beirut. Smart contracts, DeFi backends, mobile and web products, built end to end.",
    url: "/",
    siteName: "Alexandre El-Khoury Portfolio",
    locale: "en_US",
    firstName: "Alexandre",
    lastName: "El-Khoury",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alexandre El-Khoury | Software & Blockchain Engineer",
    description: "Software and blockchain engineer in Beirut. Smart contracts, DeFi backends, mobile and web products.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Viewport config
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Alexandre El-Khoury",
  jobTitle: "Software & Blockchain Engineer",
  url: "https://portfolio-nextjs--portfolio-software-engineer.europe-west4.hosted.app",
  sameAs: [
    "https://github.com/alexandreelkhoury",
    "https://www.linkedin.com/in/alexandre-khoury/",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Beirut",
    addressCountry: "LB",
  },
  knowsAbout: ["Blockchain", "Solidity", "DeFi", "Smart Contracts", "React", "Next.js", "Node.js", "Web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${orbitron.variable} ${exo2.variable} ${geistMono.variable} antialiased relative overflow-x-hidden bg-[var(--bg-surface)]`}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
