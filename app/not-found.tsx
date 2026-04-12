import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl sm:text-8xl font-bold font-[family-name:var(--font-orbitron)] text-transparent bg-gradient-to-br from-neutral-300 to-neutral-500 bg-clip-text mb-4">
          404
        </h1>
        <p className="text-neutral-400 text-lg mb-8">
          This page doesn't exist in any blockchain.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Portfolio
        </Link>
      </div>
    </div>
  );
}
