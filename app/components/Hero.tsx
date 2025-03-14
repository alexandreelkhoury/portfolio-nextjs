'use client';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import useMousePosition from '../utils/useMousePosition.js';
import ConnectButton from './ConnectButton';

const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export default function Hero() {
    const containerRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);
    const { scrollY } = useScroll({ target: containerRef });
    const y = useTransform(scrollY, [0, 300], [0, 0]); // Reduced parallax distance for mobile
    const rotateX = useTransform(scrollY, [0, 300], [0, 10]);
    const scale = useTransform(scrollY, [0, 300], [1, 1.03]);
    const shadow = useTransform(scrollY, [0, 300],
        ['0 0 0px rgba(0,0,0,0)', '0 15px 30px -5px rgba(59,130,246,0.2)']
    );
    const shadowTemplate = useMotionTemplate`${shadow}`;

    // SSR-safe node positions
    const nodePositions = Array.from({ length: 10 }, (_, i) => ({
        x: (seededRandom(i) * 100 - 50) + '%',
        y: (seededRandom(i + 10) * 100 - 50) + '%',
    }));

    // UseEffect to handle client-only logic (like window.innerHeight)
    useEffect(() => {
        setIsMounted(true);
        const handleResize = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ensure this only renders after the component is mounted (on the client side)
    if (!isMounted) return null;

    return (
        <div id="hero">
            <motion.section
                ref={containerRef}
                style={{
                    y,
                    scale,
                    rotateX,
                    boxShadow: shadowTemplate,
                }}
                className="relative h-[calc(var(--vh,1vh)*100)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/50 overflow-hidden"
            >

                {/* Mobile-optimized blockchain nodes */}
                <div className="absolute inset-0 z-0">
                    {nodePositions.map((pos, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                scale: 0,
                                x: pos.x,
                                y: pos.y,
                            }}
                            animate={{
                                opacity: [0, 0.2, 0],
                                scale: [0, 1.2, 1.5],
                            }}
                            transition={{
                                duration: 4 + (i * 0.2),
                                repeat: Infinity,
                                delay: i * 0.1,
                            }}
                            className="absolute w-[2px] h-[2px] md:w-1 md:h-1 bg-blue-400 rounded-full"
                        />
                    ))}
                </div>

                {/* Responsive gradient blob */}
                <motion.div
                    animate={{
                        x: ['0%', '3%', '0%'],
                        y: ['0%', '-3%', '0%'],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute -top-[30%] -left-[15%] w-[130%] h-[130%] md:-top-[50%] md:-left-[25%] md:w-[150%] md:h-[150%] bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-[50px] md:blur-[100px]"
                />

                {/* Responsive content */}
                <div className="relative z-10 text-center px-4 md:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-6 md:mb-8"
                    >
                        <p className="text-blue-400 font-mono text-sm md:text-lg mb-2 md:mb-4 tracking-widest">
                            HI, I'M
                        </p>
                        <motion.h1
                            className="text-4xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-300 to-blue-600 bg-clip-text text-transparent mb-4 md:mb-6 px-2"
                            style={{
                                backgroundSize: '200% 100%',
                                lineHeight: '1.2',
                            }}
                        >
                            <span className="name">Alexandre <span className="block md:inline">El-Khoury</span> </span>
                        </motion.h1>
                        <motion.div
                            className="text-xl md:text-4xl lg:text-5xl font-semibold text-gray-300 mb-6 md:mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="block md:inline">Software</span>{' '}
                            <span className="block md:inline">Engineer</span>
                        </motion.div>
                    </motion.div>



                    {/* Mobile-friendly CTA */}
                    <motion.div
                        className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="relative inline-block w-auto md:w-[220px]"> {/* Adjust size to match your button */}
                            <ConnectButton />
                        </div>

                    </motion.div>

                    {/* Stacked badges on mobile */}
                    <motion.div
                        className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base">
                            <span className="text-blue-400 mr-2">🚀</span>
                            <span className="text-gray-300">10+ Blockchain Projects</span>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base">
                            <span className="text-purple-400 mr-2">⛓️</span>
                            <span className="text-gray-300">Smart Contract Expert</span>
                        </div>
                    </motion.div>
                </div>

                {/* Mobile-optimized scroll indicator */}
                <motion.div
                    className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <div className="w-6 h-10 md:w-8 md:h-14 rounded-xl md:rounded-3xl border-2 border-blue-400 flex justify-center p-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-scroll" />
                    </div>
                </motion.div>

            </motion.section>
        </div>
    );
}
