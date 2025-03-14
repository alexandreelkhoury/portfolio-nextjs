'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, SpringOptions, useMotionValue } from 'framer-motion';

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export default function Spotlight({
}: SpotlightProps) {
  
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
    const hero = document.getElementById('Hero'); // Get Hero section
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
      cursorX.set(lastMouseX - 100);
      cursorY.set(lastMouseY - 100);
    };

    const updateCursorOnScroll = () => {
      if (isInsideHero) {
        cursorY.set(lastMouseY - 100);
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
      className="
      fixed top-0 left-0 w-50 h-50 
      rounded-full 
      bg-gradient-to-br
      blur-xl 
      transition-opacity 
      duration-200 
      from-zinc-50 
      via-zinc-100 
      to-zinc-200 
      mix-blend-difference"
      style={{ x, y, scale, opacity: isInsideHero ? "1" : "0" }}
      animate={{
        scale: isHovering ? 1.2 : 1,
      }}
    />
  );
}
