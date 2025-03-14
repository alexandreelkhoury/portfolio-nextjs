// components/ParallaxBackground.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const Background = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const layer1Y = useTransform(scrollYProgress, [0, 1], ['-30%', '30%']);
  const layer2Y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const layer3Y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <div ref={ref} className="absolute inset-0 z-0 overflow-hidden">
      {/* Back layer */}
      <motion.div
        style={{ y: layer1Y }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)] 
                   will-change-transform"
      />

      {/* Middle layer */}
      <motion.div
        style={{ y: layer2Y }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.05),transparent_70%)] 
                   will-change-transform"
      />
      
      {/* Front layer */}
      <motion.div
        style={{ y: layer3Y }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.02),transparent_70%)] 
                   will-change-transform"
      />
    </div>
  );
};

export default Background;