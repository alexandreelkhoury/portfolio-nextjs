'use client';
import { motion, useReducedMotion } from 'framer-motion';

const stats = [
  { value: '5+', label: 'Years in Web3' },
  { value: '10+', label: 'Projects Shipped' },
  { value: '5', label: 'Chains Deployed' },
];

const principles = [
  {
    title: 'Product-First',
    description: 'Every technical decision starts with "does this ship a better product?" Architecture serves users, not the other way around.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Full-Stack Ownership',
    description: 'From smart contracts to pixel-perfect frontends. I own the entire stack so nothing falls through the cracks.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Learn Fast, Build Faster',
    description: 'New chain, new framework, new protocol. I pick it up and ship with it. Curiosity is my unfair advantage.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
      </svg>
    ),
  },
];

export default function AboutMe() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="about" className="bg-[var(--bg-surface)] py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-orbitron)] text-transparent bg-gradient-to-br from-neutral-300 to-neutral-500 bg-clip-text mb-6 relative inline-block">
              About Me
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-700 rounded-full" />
            </h2>

            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed mt-8 mb-4">
              I'm a builder who loves understanding the full picture. Frontend, backend, blockchain, AI, infrastructure. I don't pick a lane. I pick whatever gets the product shipped.
            </p>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-8">
              I'm driven by curiosity and the challenge of learning new systems fast. If something powers a product, I want to understand how it works and make it better. Based in Paris, building across the stack.
            </p>

            {/* Download CV */}
            <motion.a
              href="/Alexandre_El-Khoury_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-neutral-200 text-sm font-medium hover:bg-white/20 transition-colors mb-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CV
            </motion.a>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className="text-center sm:text-left"
                >
                  <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-white">
                    {stat.value}
                  </div>
                  <div className="text-neutral-500 text-xs sm:text-sm mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-8">How I Work</h3>

              <div className="space-y-6">
                {principles.map((principle, i) => (
                  <motion.div
                    key={principle.title}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 flex-shrink-0">
                      {principle.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{principle.title}</h4>
                      <p className="text-neutral-400 text-sm leading-relaxed">{principle.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-neutral-500 text-sm">
                  Math degree from Université de Paris · Master's in Blockchain Engineering from ESGI
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
