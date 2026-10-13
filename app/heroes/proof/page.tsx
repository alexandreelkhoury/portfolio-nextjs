import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import ProofHero from './ProofHero';

const serif = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--pf-serif',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--pf-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Proof | Alexandre El-Khoury',
  robots: { index: false },
};

export default function ProofPage() {
  return <ProofHero className={`${serif.variable} ${mono.variable}`} />;
}
