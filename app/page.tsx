import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import ProofSite from './components/proof/ProofSite';

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

export default function Home() {
  return <ProofSite className={`${serif.variable} ${mono.variable}`} />;
}
