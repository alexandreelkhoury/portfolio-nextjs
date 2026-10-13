// Gallery-label copy for the five droplets. Titles and links come from app/data/projects.js.
import projects from '../../data/projects';

type P = { title: string; url: string };
const byTitle = (t: string) => (projects as P[]).find((p) => p.title === t);

const lines: { title: string; medium: string; line: string }[] = [
  { title: 'SPL Token Launcher', medium: 'Solana', line: 'Launch a token in under two minutes.' },
  { title: 'CoreX', medium: 'React, Firebase, Stripe', line: 'Scheduling, payments and check-ins for fitness coaches.' },
  { title: 'HireWise', medium: 'Python, AI', line: 'Matches candidates to roles with natural language analysis.' },
  { title: 'TipMe', medium: 'Base L2', line: 'Crypto tips in ETH or USDC with sub-cent gas.' },
  { title: 'Stamply', medium: 'Apple and Google Wallet', line: 'Loyalty cards that replace paper punch cards.' },
];

export const work = lines.map((l) => ({ ...l, url: byTitle(l.title)?.url ?? '#' }));
