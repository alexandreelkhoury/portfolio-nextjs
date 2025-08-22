'use client';
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useScroll, spring, animate } from 'framer-motion';
import {
  FaEthereum,
  FaReact,
  FaServer,
  FaDatabase
} from 'react-icons/fa';
import {
  SiSolidity,
  SiWeb3Dotjs,
  SiNextdotjs,
  SiNodedotjs,
  SiSolana,
  SiChainlink,
  SiTailwindcss,
  SiMongodb,
  SiVite,
  SiNestjs,
  SiExpress,
  SiTypescript,
  SiBitcoin,
  SiGooglecloud,
  SiPostgresql,
  SiDocker,
  SiXrp,
  SiEthers
} from 'react-icons/si';
import CursorGlow from './CursorGlow';

interface Skill {
  id: number;
  icon: React.ReactElement<{ className?: string }>; // Allow className as an optional prop
  title: string;
  gradient: string[];
  technologies: {
    icon: React.ReactElement<{ className?: string }>; // Allow className as an optional prop
    name: string;
  }[];
  description: string;
}

const blockchainIcons = [FaEthereum, SiSolidity, SiWeb3Dotjs, SiSolana, SiChainlink, SiXrp, SiEthers];
const frontendIcons = [FaReact, SiNextdotjs, SiTailwindcss, SiTypescript, SiVite];
const backendIcons = [SiNodedotjs, SiNestjs, SiMongodb, SiExpress, SiBitcoin, SiPostgresql, FaDatabase, SiGooglecloud, SiDocker];
const fallingIcons = [...blockchainIcons, ...frontendIcons, ...backendIcons];

interface SkillCardProps {
  skill: Skill;
  index: number;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX - rect.width / 2);
    y.set(mouseY - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      className="relative p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-gray-800/40 shadow-2xl overflow-hidden group"
      style={{ 
        perspective: '1000px',
        background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8), rgba(31, 31, 31, 0.6))',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -5,
        scale: typeof window !== 'undefined' && window.innerWidth >= 768 ? 1.03 : 1.01,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 255, 255, 0.05)",
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20 group-hover:opacity-40 transition-opacity duration-300" 
           style={{ padding: '1px' }}>
        <div className="w-full h-full rounded-2xl sm:rounded-3xl bg-transparent" />
      </div>

      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br rounded-2xl sm:rounded-3xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${skill.gradient[0]}15, ${skill.gradient[1]}25)`
        }}
        initial={{ opacity: 0.2 }}
        animate={{
          opacity: isHovered ? 0.4 : 0.2,
        }}
        transition={{
          opacity: { duration: 0.4, ease: "easeInOut" },
        }}
      />

      {/* Subtle shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl sm:rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* 3D content container */}
      <motion.div
        className="relative z-10 text-center"
        style={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <motion.div
          className="mb-6 sm:mb-8 flex justify-center"
          whileHover={{ scale: 1.1, rotate: 15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div 
              className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full blur-lg opacity-50"
              style={{ 
                background: `linear-gradient(135deg, ${skill.gradient[0]}, ${skill.gradient[1]})` 
              }}
            />
            {/* Icon container */}
            <div 
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full backdrop-blur-lg flex items-center justify-center border border-white/10"
              style={{
                background: `linear-gradient(135deg, rgba(17, 17, 17, 0.9), rgba(31, 31, 31, 0.8))`
              }}
            >
              {React.cloneElement(skill.icon, {
                className: `text-2xl sm:text-3xl ${index === 0 ? 'text-green-400' : index === 1 ? 'text-blue-400' : 'text-orange-400'}`,
              })}
            </div>
          </div>
        </motion.div>

        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent text-center block"
          style={{ backgroundImage: `linear-gradient(45deg, ${skill.gradient[0]}, ${skill.gradient[1]})` }}>
          {skill.title}
        </h3>

        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base px-2">
          {skill.description}
        </p>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
          {skill.technologies.map((tech, i) => (
            <motion.div
              key={i}
              className="relative flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 overflow-hidden group/tech"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8), rgba(31, 31, 31, 0.6))'
              }}
              whileHover={{ 
                scale: typeof window !== 'undefined' && window.innerWidth >= 768 ? 1.1 : 1.05,
                y: -2
              }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {/* Subtle glow on hover */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover/tech:opacity-30 transition-opacity duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${skill.gradient[0]}20, ${skill.gradient[1]}30)` 
                }}
              />
              <div className="relative z-10 flex items-center gap-1 sm:gap-2">
                {React.cloneElement(tech.icon, {
                  className: `text-sm sm:text-base md:text-lg ${index === 0 ? 'text-green-400' : index === 1 ? 'text-blue-400' : 'text-orange-400'}`,
                })}
                <span className="text-xs sm:text-sm font-medium text-gray-200">{tech.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Expertise() {

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const skills = [
    {
      id: 1,
      icon: <FaEthereum size={48} />,
      title: "Blockchain Development",
      gradient: ["#10B981", "#34D399"],
      technologies: [
        { icon: <SiSolidity />, name: "Solidity" },
        { icon: <SiSolana />, name: "Solana" },
        { icon: <SiChainlink />, name: "Chainlink" },
        { icon: <FaEthereum />, name: "EVM" },
      ],
      description: "Implementing decentralized protocols and smart contract systems"
    },
    {
      id: 2,
      icon: <FaReact size={48} />,
      title: "Frontend Development",
      gradient: ["#3B82F6", "#6366F1"],
      technologies: [
        { icon: <FaReact />, name: "React.js" },
        { icon: <SiNextdotjs />, name: "Next.js" },
        { icon: <SiTailwindcss />, name: "Tailwind" },
        { icon: <SiTypescript />, name: "TypeScript" }
      ],
      description: "Developing modern web interfaces with interactive user experiences"
    },
    {
      id: 3,
      icon: <FaServer size={48} />,
      title: "Backend Development",
      gradient: ["#F59E0B", "#F43F5E"],
      technologies: [
        { icon: <SiNodedotjs />, name: "Node.js" },
        { icon: <SiNestjs />, name: "NestJS" },
        { icon: <SiMongodb />, name: "MongoDB" },
        { icon: <SiExpress />, name: "Express" },
      ],
      description: "Building scalable server-side architectures and APIs"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delay: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8,
      rotate: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.1,
      }
    }
  };

  return (
    <section id="expertise" className="relative pt-10 pb-8 sm:pb-12 overflow-visible z-30">
      {/* <CursorGlow /> */}

      {/* Animated logo background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#0A0A0A] overflow-hidden">
        {isClient && [...Array(typeof window !== 'undefined' && window.innerWidth >= 768 ? 15 : 8)].map((_, i) => {
          const IconComponent = fallingIcons[Math.floor(Math.random() * fallingIcons.length)];
          const category = blockchainIcons.includes(IconComponent) ? 'blockchain'
            : frontendIcons.includes(IconComponent) ? 'frontend'
              : 'backend';
          const colors = {
            blockchain: '#10B981',
            frontend: '#3B82F6',
            backend: '#F59E0B'
          };

          return (
            <motion.div
              key={i}
              className="absolute flex items-center justify-center "
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                color: colors[category],
                transform: `rotate(${Math.random() * 360}deg)`,
                filter: `drop-shadow(0 0 10px ${colors[category]}80) 
                  drop-shadow(0 0 10px ${colors[category]}90)`
              }}
              animate={{
                y: [0, window.innerHeight * 1.2],
                opacity: [0.6, 0],
                scale: [Math.random() * 0.6 + 0.4, 0.1],
                rotate: [0, Math.random() > 0.5 ? 360 : -360] // Keep rotation
              }}
              transition={{
                duration: Math.random() * 5 + 6,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <IconComponent
                size={`${Math.random() * 8 + 6}rem`}
                className="drop-shadow-lg"
              />
            </motion.div>
          );
        })}
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-7 pt-14">
        <div className="flex justify-center relative px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-6 sm:mb-8 md:mb-12 text-transparent 
       bg-gradient-to-br from-neutral-300 to-neutral-500
       bg-clip-text inline-block w-fit relative px-2"> {/* Added relative here */}
              Technical Expertise
              <div className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 right-0 mx-auto h-0.5 sm:h-1 
            bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-700 
            rounded-full" />
            </h2>
          </motion.div>
        </div>
        {/* from-[#05df72] via-[#3B82F6] to-[#ff8904] */}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 py-8 sm:py-12 md:py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              variants={cardVariants}
              custom={index}
            >
              <SkillCard skill={skill} index={index} />
            </motion.div>
          ))}
        </motion.div>



      </div>

    </section>

  );
}