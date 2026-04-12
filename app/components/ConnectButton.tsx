'use client';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SiLinkedin, SiGmail } from 'react-icons/si';

const ConnectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        window.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [isModalOpen]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [12, -12]), {
    stiffness: 400,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-12, 12]), {
    stiffness: 400,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  return (
    <>
      <div
        style={{ perspective: '800px' }}
        onMouseLeave={() => {
          mouseX.set(0.5);
          mouseY.set(0.5);
        }}
      >
        <motion.button
          className="group relative flex items-center justify-center px-6 py-4
            rounded-xl text-white font-semibold text-base md:text-lg
            focus:outline-none backdrop-blur-sm
            bg-white/10 border border-white/15
            hover:bg-white/15 hover:border-white/25
            shadow-lg shadow-black/20
            overflow-hidden cursor-pointer
            transition-colors duration-200"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          onClick={openModal}
          onMouseMove={handleMouseMove}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Subtle shine on hover */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          />

          <div className="relative z-10 flex items-center gap-3">
            <span>Let's Connect</span>
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeModal}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative z-10 rounded-2xl p-8 md:p-10 w-full max-w-md mx-4
                border border-white/10 backdrop-blur-xl
                shadow-2xl shadow-black/20"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.95), rgba(31, 31, 31, 0.9))'
              }}
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
                y: 20,
                transition: { duration: 0.2, ease: 'easeIn' }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 p-2 rounded-full cursor-pointer
                  hover:bg-white/10 transition-colors duration-200
                  flex items-center justify-center w-8 h-8"
                onClick={closeModal}
              >
                <svg
                  className="w-4 h-4 text-neutral-500 hover:text-neutral-300 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <motion.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Get in Touch
                </h3>
                <p className="text-neutral-500 text-sm mt-2">
                  Pick your preferred channel
                </p>
              </motion.div>

              {/* Contact Options */}
              <div className="space-y-3">
                {/* Email */}
                <motion.a
                  href="mailto:alexkhoury@hotmail.com"
                  className="group relative flex items-center px-5 py-4
                    bg-white/5 hover:bg-white/10 rounded-xl
                    border border-white/10 hover:border-white/20
                    transition-all duration-200"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <SiGmail className="w-5 h-5 mr-4 text-neutral-500 group-hover:text-[#EA4335] transition-colors duration-200 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-neutral-200 text-sm">Email</p>
                    <p className="text-xs text-neutral-500">alexkhoury@hotmail.com</p>
                  </div>
                  <svg className="w-4 h-4 ml-auto text-neutral-600 group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.a>

                {/* LinkedIn */}
                <motion.a
                  href="https://www.linkedin.com/in/alexandre-khoury/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center px-5 py-4
                    bg-white/5 hover:bg-white/10 rounded-xl
                    border border-white/10 hover:border-white/20
                    transition-all duration-200"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SiLinkedin className="w-5 h-5 mr-4 text-neutral-500 group-hover:text-[#0A66C2] transition-colors duration-200 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-neutral-200 text-sm">LinkedIn</p>
                    <p className="text-xs text-neutral-500">alexandre-khoury</p>
                  </div>
                  <svg className="w-4 h-4 ml-auto text-neutral-600 group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConnectButton;
