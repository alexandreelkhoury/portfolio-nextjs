/*
 * Every fact on the page lives here. Sources: app/data (old site), the old About,
 * Expertise and Footer components, and public/Alexandre_El-Khoury_CV.pdf.
 * Nothing is invented: no number appears that is not in one of those sources.
 */

/** Personal location line. Kept in one constant so it is easy to change. */
export const LOCATION = 'Beirut';

export const NAME = 'Alexandre El-Khoury';
export const TITLE = 'Software & Blockchain Engineer';

export const LINKS = {
  email: 'alexkhoury@hotmail.com',
  github: 'https://github.com/alexandreelkhoury',
  linkedin: 'https://www.linkedin.com/in/alexandre-khoury/',
  cv: '/Alexandre_El-Khoury_CV.pdf',
};

export type Chapter = { id: string; num: string; title: string };

export const CHAPTERS: Chapter[] = [
  { id: 'ch-1', num: 'I', title: 'Before the chain, there was proof' },
  { id: 'ch-2', num: 'II', title: 'The first block' },
  { id: 'ch-3', num: 'III', title: 'Building the chain' },
  { id: 'ch-4', num: 'IV', title: 'Figures' },
  { id: 'ch-5', num: 'V', title: 'Present tense' },
  { id: 'ch-qed', num: '∎', title: 'Q.E.D.' },
];

/** Captions for the margin figure, one per shape, in shape order. */
export const FIGURE_CAPTIONS = [
  'Enneper surface, order two',
  'Merkle tree, root = H(a, b)',
  'y² = x³ − x + 1 over a lattice',
  'Three chains and their bridges',
  'Laptop and phone, in wireframe',
  'Everything, connected',
  'Quod erat demonstrandum',
];

export type Project = {
  fig: number;
  title: string;
  device: 'laptop' | 'tablet' | 'monitor';
  media: { kind: 'video' | 'image'; src: string; aspect: number };
  role?: string;
  description: string;
  detail?: string;
  tech: string[];
  url: string;
  github?: string;
};

export const PROJECTS: Project[] = [
  {
    fig: 2,
    title: 'SPL Token Launcher',
    device: 'laptop',
    media: { kind: 'video', src: '/media/spl-hero-loop.mp4', aspect: 16 / 9 },
    role: 'Founder. Solo build. Solana. Dec 2024 to present.',
    description:
      'Launch your own Solana token in under 2 minutes. Handles token creation, metadata upload to IPFS, and liquidity pool setup. No CLI required.',
    detail: 'It has facilitated hundreds of token launches and generated $10K+ in revenue.',
    tech: ['React', 'Node.js', 'Solana', 'IPFS', 'DeFi'],
    url: 'https://spltokenlauncher.pro',
    github: 'https://github.com/alexandreelkhoury',
  },
  {
    fig: 3,
    title: 'CoreX',
    device: 'tablet',
    media: { kind: 'video', src: '/media/corex-loop.mp4', aspect: 16 / 9 },
    role: 'Founder. Solo build. Mobile, web and AI.',
    description:
      'All-in-one platform for fitness coaches to manage scheduling, payments, prospects, and client check-ins. Less admin, more coaching.',
    detail:
      'A dual-role React Native app for coach and client, with workout logging, QR invites and Apple Health and Google Fit sync, powered by a custom 34-tool AI assistant in English, French and Arabic.',
    tech: ['React', 'React Native', 'Firebase', 'Node.js', 'Stripe'],
    url: 'https://testing-corex.web.app/',
  },
  {
    fig: 4,
    title: 'HireWise',
    device: 'monitor',
    media: { kind: 'video', src: '/media/hirewise-loop.mp4', aspect: 16 / 9 },
    role: 'Sole technical lead. Freelance.',
    description:
      'AI recruitment tool that matches candidates to roles using natural language analysis. Cuts screening time by automating resume parsing and skill extraction.',
    tech: ['React', 'Python', 'Firebase', 'AI'],
    url: 'https://hirewise.web.app',
    github: 'https://github.com/alexandreelkhoury',
  },
  {
    fig: 5,
    title: 'TipMe',
    device: 'laptop',
    media: { kind: 'image', src: '/images/tipMe.png', aspect: 2464 / 1492 },
    description:
      'Crypto tipping on Base L2. Send ETH or USDC tips with sub-cent gas fees. Built with Coinbase smart wallet integration for one-click onboarding.',
    tech: ['React', 'Solidity', 'Coinbase', 'Base'],
    url: 'https://tipme-616b3.web.app/',
    github: 'https://github.com/alexandreelkhoury',
  },
  {
    fig: 6,
    title: 'Stamply',
    device: 'tablet',
    media: { kind: 'image', src: '/images/stamply.png', aspect: 2560 / 1440 },
    description:
      'Digital loyalty card platform replacing paper punch cards. Lives in Apple and Google Wallet. Businesses set up in 3 minutes, customers join in 10 seconds.',
    tech: ['React', 'Node.js', 'Firebase', 'Stripe'],
    url: 'https://stamply-leb.netlify.app/',
  },
];

export const MOTION = [
  { key: 'a', label: 'Sovra', src: '/media/sovra-loop.mp4', aspect: 16 / 9 },
  { key: 'b', label: 'Pithly', src: '/media/pithly-loop.mp4', aspect: 1 },
  { key: 'c', label: 'AskLex', src: '/media/asklex-loop.mp4', aspect: 16 / 9 },
  { key: 'd', label: 'Yelo', src: '/media/yelo-loop.mp4', aspect: 9 / 16 },
];

/** Chapter V: what the work at Sovra touches, set like a table of contents. */
export const SOVRA_TOC = [
  { k: 'Mobile', v: 'iOS and Android apps in React Native' },
  { k: 'Wallets', v: 'Account abstraction, Google sign-in, gasless transactions' },
  { k: 'Yield', v: 'Aave and Morpho integrations' },
  { k: 'Payments', v: 'Fiat on and off-ramp, card issuance, end-to-end KYC' },
  { k: 'Backend', v: 'REST APIs in Express, on-chain automations, notifications' },
  { k: 'Internal', v: 'The admin dashboard' },
  { k: 'Operations', v: 'Dev and production environments, end to end' },
];

export const TOOLBOX = [
  { k: 'Blockchain', v: 'Solidity, EVM, Solana, Bitcoin, Uniswap, Aave, Morpho, Chainlink, CCTP' },
  { k: 'Frontend', v: 'React Native, React, Next.js, Tailwind, TypeScript' },
  { k: 'Backend', v: 'Node.js, Express, MariaDB' },
  { k: 'Infrastructure', v: 'AWS' },
];
