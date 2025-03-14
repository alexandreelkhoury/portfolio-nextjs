'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CursorBubble() {
  const [isHovering, setIsHovering] = useState(false);
  const [isInsideHero, setIsInsideHero] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const scale = useSpring(1, springConfig);
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);
  const heroRef = useRef<HTMLElement | null>(null);
  let lastMouseX = 0;
  let lastMouseY = 0;

  useEffect(() => {
    const hero = document.getElementById('hero'); // Get Hero section
    if (!hero) return;
    
    heroRef.current = hero;

    const moveCursor = (e: MouseEvent) => {
      if (!hero.contains(e.target as Node)) {
        setIsInsideHero(false);
        return;
      }
      setIsInsideHero(true);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      cursorX.set(lastMouseX - 16);
      cursorY.set(lastMouseY - 16);
    };

    const updateCursorOnScroll = () => {
      if (isInsideHero) {
        cursorY.set(lastMouseY - 16);
      }
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, .interactive'));
    };

    const handleMouseLeave = () => {
      setIsInsideHero(false);
    };

    hero.addEventListener('mousemove', moveCursor);
    hero.addEventListener('mouseover', handleHover);
    hero.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', updateCursorOnScroll);

    return () => {
      hero.removeEventListener('mousemove', moveCursor);
      hero.removeEventListener('mouseover', handleHover);
      hero.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', updateCursorOnScroll);
    };
  }, [cursorX, cursorY, isInsideHero]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full pointer-events-none z-50 mix-blend-difference"
      style={{ x, y, scale, opacity: isInsideHero ? "1" : "0" }} // Hide when outside Hero
      animate={{
        scale: isHovering ? 1.5 : 1,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 15 },
      }}
    />
  );
}
