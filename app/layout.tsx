import type { Metadata, Viewport } from "next"; // Import Viewport type
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  FaGithub,
  FaLinkedin
} from 'react-icons/fa';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Remove viewport from metadata
export const metadata: Metadata = {
  title: "My Portfolio",
  description: "My portfolio website",
};

// 2. Add separate viewport export
export const viewport: Viewport = {
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative overflow-x-hidden`}
      >
        <div>
          {children}
        </div>
        <footer className="bg-[#0A0A0A] border-t border-neutral-400 text-white py-12 ">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Section */}
            <div className="text-center md:text-left space-y-4">
              <h3 className="text-xl font-semibold text-neutral-500">Let's Connect</h3>
              <div className="flex flex-col space-y-2 text-neutral-300">
                <a href="mailto:alexkhoury@hotmail.com" target="_blank" className="hover:text-white transition-colors">
                  alexkhoury@hotmail.com
                </a>
                <p>+33 7 49 99 04 69</p>
                <p>Paris, France</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center md:text-left space-y-4">
              <h3 className="text-xl font-semibold text-neutral-500">Follow Me</h3>
              <div className="flex justify-center md:justify-start space-x-6">
                <a href="https://github.com/alexandreelkhoury" target="_blank" className="hover:text-white transition-colors" aria-label="GitHub">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                    {/* GitHub SVG Path */}
                    <FaGithub />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/alexandre-khoury/" target="_blank" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                    {/* LinkedIn SVG Path */}
                    <FaLinkedin />
                  </svg>
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="text-center md:text-left space-y-4">
              <h3 className="text-xl font-semibold text-neutral-500">Stay Updated</h3>
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-transparent border border-neutral-400 rounded-lg px-4 py-2 focus:outline-none focus:border-white"
                />
                <button className="bg-neutral-500 hover:bg-neutra-l-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-neutral-800 pt-8">
            <p className="text-center text-neutral-400 text-sm">
              © {new Date().getFullYear()} Alexandre El-Khoury. All rights reserved.
              <span className="ml-2">Made with ❤️ using Next.js</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
