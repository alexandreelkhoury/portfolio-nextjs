import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import LiquidityHero from './LiquidityHero';

const geist = Geist({ subsets: ['latin'], variable: '--font-liq', display: 'swap' });

export const metadata: Metadata = {
  title: 'Liquidity | Alexandre El-Khoury',
  description: 'Hero option C: a pool of liquid chrome that splits into the droplets of the work.',
};

export default function Page() {
  return <LiquidityHero fontClass={geist.variable} />;
}
