// 'use client';
// import { motion, useMotionValue, useSpring, useDragControls } from 'framer-motion';
// import { useState, useEffect, useRef } from 'react';

// export default function Badge() {
//   const [isDragging, setIsDragging] = useState(false);
//   const dragControls = useDragControls();
//   const rotation = useSpring("0deg", { stiffness: 100, damping: 10 });
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);
//   const longPressTimer = useRef<NodeJS.Timeout | null>(null);
//   const badgeRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const spin = () => rotation.set((prev) => `${parseFloat(prev) + 360}deg`);
//     const interval = setInterval(spin, 8000);
//     return () => clearInterval(interval);
//   }, [rotation]);

//   const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!badgeRef.current || longPressTimer.current) return;
    
//     longPressTimer.current = setTimeout(() => {
//       setIsDragging(true);
//       dragControls.start(e.nativeEvent, { element: badgeRef.current });
//     }, 300);
//   };

//   const handlePointerUp = () => {
//     if (longPressTimer.current) {
//       clearTimeout(longPressTimer.current);
//       longPressTimer.current = null;
//     }
//     setIsDragging(false);
//   };

//   return (
//     <motion.div
//       ref={badgeRef}
//       className="fixed z-50 bottom-8 right-8 cursor-pointer"
//       style={{ x, y, rotate: rotation }}
//       drag={isDragging}
//       dragControls={dragControls}
//       dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
//       dragElastic={0.5}
//       onPointerDown={handlePointerDown} // Unified pointer event
//       onPointerUp={handlePointerUp}
//       whileTap={{ scale: 1.1 }}
//       whileDrag={{ scale: 1.15 }}
//       animate={{
//         boxShadow: isDragging 
//           ? "0 10px 30px rgba(0,255,135,0.5)" 
//           : "0 5px 15px rgba(0,0,0,0.2)"
//       }}
//       transition={{ duration: 0.3 }}
//     >
//       <div className="relative">
//         {/* Pulsing border with unit-aware rotation */}
//         <motion.div 
//           className="absolute inset-0 rounded-full border-2 border-green-500/50"
//           animate={{
//             scale: [1, 1.2, 1],
//             opacity: [0.5, 0.2, 0.5],
//             rotate: [-10, 10, -10].map(deg => `${deg}deg`) // Add units
//           }}
//           transition={{ repeat: Infinity, duration: 2 }}
//         />
        
//         {/* Main badge */}
//         <motion.div 
//           className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-cyan-400 shadow-lg flex items-center justify-center"
//           whileHover={{ scale: 1.05 }}
//         >
//           <div className="text-center">
//             <h3 className="text-white text-xl font-bold">Open to Work</h3>
//             <p className="text-white/80 text-sm mt-1">Hiring? Let's talk!</p>
//           </div>
//         </motion.div>
        
//         {/* Trail effect */}
//         <motion.div 
//           className="absolute inset-0 rounded-full bg-white/10"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: isDragging ? 0.3 : 0 }}
//           transition={{ duration: 0.2 }}
//         />
//       </div>
//     </motion.div>
//   );
// }