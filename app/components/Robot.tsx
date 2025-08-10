'use client';

import { SplineScene } from "./Splite";
import { Card } from "./Card";
import { motion } from 'framer-motion';
import ConnectButton from './ConnectButton';
import { useEffect, useState } from 'react';
import Spotlight from "./Spotlight"
import dynamic from 'next/dynamic'

const NoSSR = dynamic(() => import('./Spotlight'), { ssr: false })

function SplineSceneBasic() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 1500); // 1200px is the breakpoint for wider screens
    setIsMobile(window.innerWidth < 768); // Mobile breakpoint
  };

  useEffect(() => {
    handleResize(); // Check screen size on mount
    window.addEventListener('resize', handleResize); // Update on resize
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  return (
    <section id="Hero">
      <Card className="w-full h-[100vh] bg-[#0A0A0A] relative overflow-hidden">

        {!isMobile && <Spotlight />}

        <div className="flex h-full">
          {/* Main Content Container */}
          <div className={`w-full flex justify-center items-center ${isLargeScreen ? 'md:w-[45%]' : 'flex justify-center items-center'} p-3 sm:p-6 md:p-8 relative z-10`}>
            {/* Left Content */}
            <motion.div
              className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.61, 1, 0.88, 1]
              }}
            >
              {/* Intro Text */}
              <motion.p
                className="text-neutral-400 font-mono text-xs sm:text-sm md:text-base lg:text-lg 
               tracking-widest uppercase mb-3 sm:mb-4 md:mb-6 lg:mb-8 px-2"
                style={{ letterSpacing: '0.18em' }}
              >
                HI, I'M
              </motion.p>

              {/* Gradient Title */}
              <motion.h1
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black 
               bg-clip-text text-transparent bg-gradient-to-br from-neutral-50 via-neutral-200
               to-neutral-400 mb-4 sm:mb-6 md:mb-8 lg:mb-10 leading-tight px-1 relative"
                style={{
                  backgroundSize: '200% 100%',
                  backgroundPosition: '50% 0%',
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.1))'
                }}
                animate={{
                  backgroundPosition: ['50% 0%', '100% 0%', '50% 0%']
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Alexandre El-Khoury
              </motion.h1>

              {/* Subtitle */}
              <motion.div
                className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold 
               text-neutral-300 mb-6 sm:mb-8 md:mb-10 lg:mb-14 leading-relaxed px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.5,
                  duration: 0.6,
                  ease: 'anticipate'
                }}
              >
                Software Engineer
              </motion.div>

              {/* CTA Section */}
              <motion.div
                className="mt-6 sm:mt-8 md:mt-10 w-full flex justify-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25
                }}
              >
                <div className="max-w-[240px] xs:max-w-[280px] sm:max-w-[320px]">
                  <ConnectButton />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Content (3D Scene) */}
          {isLargeScreen && (
            <div className="w-[55%] relative">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          )}

          {/* Responsive Scroll Indicator */}
          <motion.div
            className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <div className="w-6 h-10 md:w-8 md:h-14 rounded-xl md:rounded-3xl border-2 border-neutral-400 flex justify-center p-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-neutral-400 rounded-full animate-pulse" />
            </div>
          </motion.div>
        </div>
      </Card>
    </section>
  )
}

export default SplineSceneBasic;