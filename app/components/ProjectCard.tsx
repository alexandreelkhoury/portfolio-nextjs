'use client';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

export default function ProjectCard({ 
  img, 
  title, 
  url, 
  tech = [],
  gradient,
  index,
  isActive,
  mousePosition
}: { 
  img: string;
  title: string;
  url: string;
  tech?: string[];
  gradient: string[];
  index: number;
  isActive: boolean;
  mousePosition: { x: number; y: number };
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [localMouse, setLocalMouse] = useState({ x: 0, y: 0 });
  
  // 3D Transform Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-200, 200], [15, -15]);
  const rotateY = useTransform(x, [-200, 200], [-15, 15]);
  const translateZ = useMotionValue(0);
  
  // Hover effects
  const scale = useTransform(translateZ, [0, 50], [1, 1.05]);
  const shadow = useTransform(translateZ, [0, 50], ['0 20px 40px rgba(0,0,0,0.2)', '0 40px 80px rgba(0,0,0,0.4)']);

  // Magnetic effect
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setLocalMouse({
        x: e.clientX - rect.left - rect.width/2,
        y: e.clientY - rect.top - rect.height/2
      });
    };

    if (isActive) {
      window.addEventListener('mousemove', updateMousePosition);
      translateZ.set(50);
    } else {
      translateZ.set(0);
    }

    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [isActive, translateZ]);

  return (
    <motion.div
      ref={cardRef}
      className="relative h-[400px] rounded-3xl overflow-hidden cursor-pointer group"
      style={{
        rotateX,
        rotateY,
        scale,
        boxShadow: shadow,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ translateZ: 50 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Glass layer */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/5 rounded-3xl" />
      
      {/* Holographic effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"
        animate={{
          background: [
            `linear-gradient(45deg, ${gradient[0]}20, ${gradient[1]}40)`,
            `linear-gradient(135deg, ${gradient[1]}40, ${gradient[0]}20)`
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'mirror'
        }}
      />

      {/* Floating image */}
      <motion.div
        className="absolute inset-0"
        style={{
          scale: 1.1,
          x: useTransform(() => localMouse.x * 0.1),
          y: useTransform(() => localMouse.y * 0.1)
        }}
      >
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover"
          quality={100}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
        />
      </motion.div>

      {/* Content overlay */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
        initial={{ y: 100 }}
        animate={{ y: isActive ? 0 : 100 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
        
        {/* Tech bubbles */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tech.map((t, i) => (
            <motion.span
              key={t}
              className="px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm bg-white/5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 500,
                delay: i * 0.1 + 0.3
              }}
            >
              {t}
            </motion.span>
          ))}
        </div>

        {/* Interactive button */}
        <motion.a
          href={url}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all"
          whileHover={{ x: 10 }}
        >
          <span>Explore Project</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </motion.a>
      </motion.div>

      {/* Floating number */}
      <motion.span
        className="absolute top-4 right-4 text-2xl font-bold text-white/20 z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 500,
          delay: 0.5
        }}
      >
        0{index + 1}
      </motion.span>

      {/* Hover particles */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: localMouse.x,
                y: localMouse.y,
                scale: 0
              }}
              animate={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.05
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}