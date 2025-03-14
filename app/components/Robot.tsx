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

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 1500); // 1200px is the breakpoint for wider screens
  };

  useEffect(() => {
    handleResize(); // Check screen size on mount
    window.addEventListener('resize', handleResize); // Update on resize
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  return (
    <section id="Hero">
      <Card className="w-full h-[100vh] bg-[#0A0A0A] relative overflow-hidden">

        <Spotlight />

        <div className="flex h-full">
          {/* Main Content Container */}
          <div className={`w-full flex justify-center items-center ${isLargeScreen ? 'md:w-[45%]' : 'flex justify-center items-center'} p-8 relative z-10`}>
            {/* Left Content */}
            <motion.div
              className="w-full max-w-lg md:max-w-xl lg:max-w-2xl text-center"
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
                className="text-neutral-400 font-mono text-base sm:text-lg md:text-xl 
               tracking-widest uppercase mb-6 md:mb-8"
                style={{ letterSpacing: '0.18em' }}
              >
                HI, I'M
              </motion.p>

              {/* Gradient Title */}
              <motion.h1
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black 
               bg-clip-text text-transparent bg-gradient-to-br from-neutral-50 
               to-neutral-400 mb-8 md:mb-10 leading-tight"
                style={{
                  backgroundSize: '200% 100%',
                  backgroundPosition: '50% 0%'
                }}
              >
                Alexandre El-Khoury
              </motion.h1>

              {/* Subtitle */}
              <motion.div
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold 
               text-neutral-300 mb-10 md:mb-14 leading-relaxed"
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
                className="mt-8 md:mt-10 w-full flex justify-center"
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
                <div className="max-w-[280px] sm:max-w-[320px]">
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