import Link from 'next/link';

const options = [
  { slug: 'proof', name: 'B. Proof', line: 'A title page on warm paper. A mathematical surface draws itself in ink as you scroll.' },
  { slug: 'liquidity', name: 'C. Liquidity', line: 'A pool of liquid chrome you can disturb. Scroll splits it into the droplets of your work.' },
];

export default function Heroes() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] text-neutral-100 px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Hero options</h1>
        <p className="text-neutral-400 mb-12">Open each one and scroll it. Pick one, or mix parts.</p>
        <ul className="space-y-6">
          {options.map((o) => (
            <li key={o.slug}>
              <Link href={`/heroes/${o.slug}`} className="block border border-neutral-800 rounded-xl p-6 hover:border-neutral-500 transition-colors">
                <span className="text-xl font-medium">{o.name}</span>
                <p className="text-neutral-400 mt-1">{o.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
