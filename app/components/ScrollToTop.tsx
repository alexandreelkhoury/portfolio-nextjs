'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUp, Check } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clicked, setClicked] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), {
    stiffness: 500,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), {
    stiffness: 500,
    damping: 30
  });

  const toggleVisibility = () => {
    const scrolled = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress((scrolled / scrollHeight) * 100);
    setIsVisible(scrolled > 500);
  };

  const scrollToTop = () => {
    setClicked(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setClicked(false), 1000);
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            rotate: 45,
            transition: { duration: 0.3 }
          }}
          className="fixed bottom-12 right-12 z-50"
        >
          <div className="relative group">
            {/* Main button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onPointerMove={(e) => {
                const bounds = e.currentTarget.getBoundingClientRect();
                mouseX.set((e.clientX - bounds.left) / bounds.width);
                mouseY.set((e.clientY - bounds.top) / bounds.height);
              }}
              onPointerLeave={() => {
                mouseX.set(0.5);
                mouseY.set(0.5);
              }}
              style={{
                rotateX,
                rotateY,
                transformPerspective: 1000
              }}
              className={`
    w-14 h-14 sm:w-18 sm:h-18 rounded-2xl relative
    bg-gradient-to-br from-neutral-700 via-neutral-600 to-neutral-500
    shadow-2xl hover:shadow-3xl
    flex items-center justify-center
    overflow-hidden
    before:absolute before:inset-0
    before:bg-[radial-gradient(at_85%_15%,_rgba(255,255,255,0.15)_0%,_transparent_50%)]
    before:opacity-0 hover:before:opacity-100
    before:transition-opacity before:duration-300
    text-neutral-400
  `}
              aria-label="Scroll to top"
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-[conic-gradient(from_230deg_at_50%_50%,_#fff0_0%,_#fff_10%,_#fff0_20%)] opacity-0"
                animate={{
                  opacity: clicked ? 1 : 0,
                  scale: clicked ? 2 : 1
                }}
                transition={{ duration: 0.6 }}
              />

              {/* Particle burst */}
              <AnimatePresence>
                {clicked && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{
                          opacity: 0,
                          scale: 1,
                          x: Math.cos((i * 45 * Math.PI) / 180) * 40,
                          y: Math.sin((i * 45 * Math.PI) / 180) * 40
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Icon with dual animation */}
              <motion.div className="relative">
                <AnimatePresence mode='wait'>
                  {clicked ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                    >
                      <Check className="text-white w-8 h-8" strokeWidth={2} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="arrow"
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        times: [0, 0.3, 0.6, 0.8, 1]
                      }}
                    >
                      <ArrowUp className="text-white w-6 h-6 md:w-10 md:h-10" strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Dynamic border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/10 pointer-events-none" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;