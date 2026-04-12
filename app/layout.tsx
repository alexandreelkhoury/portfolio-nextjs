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

// 2. Add separate viewport export
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
        <footer className="bg-[var(--bg-surface)] border-t border-neutral-400 text-white py-8 sm:py-12 ">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Contact Section */}
            <div className="text-center sm:text-left md:text-left space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-500">Let's Connect</h3>
              <div className="flex flex-col space-y-2 text-neutral-300 text-sm sm:text-base">
                <a href="mailto:alexkhoury@hotmail.com" target="_blank" className="hover:text-white transition-colors break-all">
                  alexkhoury@hotmail.com
                </a>
                <p>+33 7 49 99 04 69</p>
                <p>Paris, France</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center sm:text-left md:text-left space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-500">Follow Me</h3>
              <div className="flex justify-center sm:justify-start md:justify-start space-x-4 sm:space-x-6">
                <a href="https://github.com/alexandreelkhoury" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
                  <FaGithub className="w-8 sm:w-10 h-8 sm:h-10" />
                </a>
                <a href="https://www.linkedin.com/in/alexandre-khoury/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <FaLinkedin className="w-8 sm:w-10 h-8 sm:h-10" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left md:text-left space-y-3 sm:space-y-4 sm:col-span-2 md:col-span-1">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-500">Quick Links</h3>
              <div className="flex flex-col space-y-2 text-neutral-300 text-sm sm:text-base">
                <a href="#expertise" className="hover:text-white transition-colors">Expertise</a>
                <a href="#timeline" className="hover:text-white transition-colors">Timeline</a>
                <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 sm:mt-12 border-t border-neutral-800 pt-6 sm:pt-8">
            <p className="text-center text-neutral-400 text-xs sm:text-sm px-4">
              © {new Date().getFullYear()} Alexandre El-Khoury. All rights reserved.
              <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">Made with ❤️ using Next.js</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
