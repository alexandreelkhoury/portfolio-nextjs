import type { Metadata, Viewport } from "next"; // Import Viewport type
import { Orbitron, Exo_2, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  FaGithub,
  FaLinkedin
} from 'react-icons/fa';

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
  title: "Alexandre El-Khoury | Blockchain & Full-Stack Developer",
  description: "Blockchain developer specializing in Solidity, DeFi protocols, and full-stack Web3 applications. Building decentralized systems on Ethereum, Solana, and Layer 2 networks from Paris, France.",
  keywords: ["blockchain developer", "solidity", "web3", "DeFi", "smart contracts", "full-stack developer", "react", "next.js", "ethereum", "solana"],
  authors: [{ name: "Alexandre El-Khoury" }],
  creator: "Alexandre El-Khoury",
  metadataBase: new URL("https://portfolio-nextjs--portfolio-software-engineer.europe-west4.hosted.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    title: "Alexandre El-Khoury | Blockchain & Full-Stack Developer",
    description: "Blockchain developer specializing in Solidity, DeFi protocols, and full-stack Web3 applications. Based in Paris, France.",
    url: "/",
    siteName: "Alexandre El-Khoury Portfolio",
    locale: "en_US",
    firstName: "Alexandre",
    lastName: "El-Khoury",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alexandre El-Khoury | Blockchain & Full-Stack Developer",
    description: "Blockchain developer specializing in Solidity, DeFi, and full-stack Web3 applications.",
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
  jobTitle: "Blockchain & Full-Stack Developer",
  url: "https://portfolio-nextjs--portfolio-software-engineer.europe-west4.hosted.app",
  sameAs: [
    "https://github.com/alexandreelkhoury",
    "https://www.linkedin.com/in/alexandre-khoury/",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Paris",
    addressCountry: "FR",
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
        <footer className="bg-[var(--bg-surface)] text-white">
          {/* CTA Section */}
          <div className="border-t border-neutral-800 py-16 sm:py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-orbitron)] text-transparent bg-gradient-to-br from-neutral-300 to-neutral-500 bg-clip-text mb-4">
                Let's build something together
              </h3>
              <p className="text-neutral-400 text-base sm:text-lg mb-8">
                Got a project in mind? I'm always interested in new challenges.
              </p>
              <a
                href="mailto:alexkhoury@hotmail.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors text-lg"
              >
                Get in Touch
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer links */}
          <div className="border-t border-neutral-800 py-8 sm:py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-neutral-500 text-sm">
                © {new Date().getFullYear()} Alexandre El-Khoury
              </p>

              <div className="flex items-center gap-6">
                <a href="#about" className="text-neutral-400 hover:text-white transition-colors text-sm">About</a>
                <a href="#expertise" className="text-neutral-400 hover:text-white transition-colors text-sm">Expertise</a>
                <a href="#timeline" className="text-neutral-400 hover:text-white transition-colors text-sm">Journey</a>
                <a href="#projects" className="text-neutral-400 hover:text-white transition-colors text-sm">Projects</a>
              </div>

              <div className="flex items-center gap-4">
                <a href="https://github.com/alexandreelkhoury" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" aria-label="GitHub">
                  <FaGithub className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/alexandre-khoury/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
