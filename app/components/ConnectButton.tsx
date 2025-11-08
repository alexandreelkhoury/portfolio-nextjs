import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SiLinkedin, SiGmail } from 'react-icons/si';
import { useEffect } from 'react';

const ConnectButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inside your ConnectButton component
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isModalOpen]);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [80, -80]);
    const rotateY = useTransform(x, [-100, 100], [-30, 30]);
    const translateZ = useTransform(y, [-100, 100], [0, 15]);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
    };

    const closeModal = () => setIsModalOpen(false);
    const openModal = () => setIsModalOpen(true);


    return (
        <>
            {/* 3D Button Container */}
            <div
                className="relative"
                style={{ perspective: '1000px' }}
                onMouseLeave={() => {
                    x.set(0);
                    y.set(0);
                }}
            >
                <motion.button
                    className="cursor-3d group relative flex items-center justify-center px-6 py-4 
           rounded-xl text-white font-semibold text-base md:text-lg 
           focus:outline-none backdrop-blur-lg border border-neutral-400 
           shadow-xl shadow-neutral-400/20 overflow-hidden"
                    style={{
                        position: 'relative',
                        background: "linear-gradient(45deg, #0A0A0A, #0A0A0A)", // Example gradient with neutral colors
                        rotateX,
                        rotateY,
                        translateZ
                    }}
                    onClick={openModal}
                    onMouseMove={handleMouseMove}
                    whileHover={{
                        scale: 1.1,
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                        default: {
                            duration: 3,
                            repeat: Infinity,
                            repeatType: 'mirror',
                            ease: 'linear'
                        },
                        scale: {
                            type: 'spring',
                            stiffness: 400,
                            damping: 10
                        }
                    }}

                >
                    {/* Dynamic Shine Effect */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none overflow-hidden"
                        style={{
                            perspective: 1000,
                            transformStyle: "preserve-3d"
                        }}
                    >
                        {/* Base shine layer */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent"
                            style={{
                                x: useTransform(x, [-100, 100], [-30, 130]),
                                y: useTransform(y, [-100, 100], [-30, 130]),
                                opacity: useTransform([x, y], ([xVal, yVal]) => {
                                    const velocity = Math.sqrt((xVal as number) ** 2 + (yVal as number) ** 2);
                                    return Math.min(velocity / 40, 0.6); // More natural opacity curve
                                }),
                                scale: useTransform([rotateX, rotateY], ([rx, ry]) =>
                                    1 + (Math.abs(rx as number) + Math.abs(ry as number)) / 1000
                                )
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 250,
                                damping: 20
                            }}
                        />

                        {/* Specular highlight */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"
                            style={{
                                x: useTransform(x, [-100, 100], [-80, 180]),
                                y: useTransform(y, [-100, 100], [-80, 180]),
                                opacity: useTransform([x, y], ([xVal, yVal]) => {
                                    const velocity = Math.sqrt((xVal as number) ** 2 + (yVal as number) ** 2);
                                    return Math.min(velocity / 60, 0.4);
                                }),
                                scale: 1.2,
                                mixBlendMode: "soft-light",
                                filter: "blur(6px)"
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 25,
                                delay: 0.05
                            }}
                        />

                        {/* Ambient reflection */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5"
                            style={{
                                rotateX,
                                rotateY,
                                opacity: useTransform(translateZ, [0, 15], [0.1, 0.3])
                            }}
                        />
                    </motion.div>
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                               opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Floating Content */}
                    <div className="relative z-10 flex items-center text-white">
                        <span>Let's Connect</span>
                        <motion.div
                            className="ml-4"
                            animate={{
                                x: [0, 8, 0],
                                rotate: [0, 15, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: 'mirror'
                            }}
                        >
                            <svg
                                className="h-5 w-5 md:h-6 md:w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path d="M14 7l-5 5m0 0l5 5" />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Depth Shadow */}
                    <motion.div
                        className="absolute inset-0 rounded-xl bg-black/20"
                        style={{
                            scale: useTransform(translateZ, [0, 15], [1, 0.9]),
                            filter: useTransform(translateZ, [0, 15],
                                ["blur(0px)", "blur(10px)"])
                        }}
                    />
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
                                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.9), rgba(31, 31, 31, 0.8))'
                            }}
                            initial={{
                                scale: 0.9,
                                opacity: 0,
                                y: 50
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.4,
                                    ease: 'easeInOut'
                                }
                            }}
                            exit={{
                                scale: 0.9,
                                opacity: 0,
                                y: 50,
                                transition: {
                                    duration: 0.3,
                                    ease: 'easeIn'
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <motion.button
                                className="absolute top-4 right-4 p-2 rounded-full cursor-pointer
                             hover:bg-white/10 transition-all duration-200
                             flex items-center justify-center w-8 h-8
                             border border-white/10 hover:border-white/20"
                                onClick={closeModal}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg
                                    className="w-4 h-4 text-neutral-400 hover:text-neutral-300 transition-colors"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </motion.button>

                            {/* Header */}
                            <motion.div
                                className="mb-8 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent
                                 bg-gradient-to-r from-neutral-300 to-neutral-500">
                                    Let's Connect
                                </h3>
                                <div className="mt-4 h-0.5 sm:h-1 bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-700
                                  rounded-full w-3/4 mx-auto" />
                            </motion.div>

                            {/* Contact Options */}
                            <div className="space-y-4">
                                {/* Email */}
                                <motion.a
                                    href="mailto:alexkhoury@hotmail.com"
                                    className="group relative flex items-center px-6 py-4
                                 backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-2xl
                                 border border-white/10 hover:border-white/20
                                 shadow-lg transition-all duration-200"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="relative z-10 flex items-center w-full">
                                        <SiGmail className="w-6 h-6 mr-4 text-neutral-400 group-hover:text-[#EA4335] transition-colors duration-200" />
                                        <div className="text-left">
                                            <p className="font-semibold text-neutral-300">Email</p>
                                            <p className="text-sm text-neutral-400">alexkhoury@hotmail.com</p>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent
                                     opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                </motion.a>

                                {/* LinkedIn */}
                                <motion.a
                                    href="https://www.linkedin.com/in/alexandre-khoury/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center px-6 py-4
                                 backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-2xl
                                 border border-white/10 hover:border-white/20
                                 shadow-lg transition-all duration-200"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="relative z-10 flex items-center w-full">
                                        <SiLinkedin className="w-6 h-6 mr-4 text-neutral-400 group-hover:text-[#0A66C2] transition-colors duration-200" />
                                        <div className="text-left">
                                            <p className="font-semibold text-neutral-300">LinkedIn</p>
                                            <p className="text-sm text-neutral-400">alexandre-khoury</p>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent
                                     opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
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