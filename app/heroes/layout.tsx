import { notFound } from 'next/navigation';

// Hero prototypes are a local lab (Liquidity is kept for later use); they never ship.
export default function HeroesLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound();
  return children;
}
