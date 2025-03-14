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
import { Briefcase, GraduationCap } from 'lucide-react';
import { timelineData } from '../data/timeline';
import { useRef } from 'react';

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
      className="relative p-12 rounded-3xl backdrop-blur-xl border border-gray-800 shadow-2xl overflow-hidden"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}  // Added
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -5,
        scale: 1.15,
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
    >
      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br"
        style={{
          backgroundImage: `linear-gradient(135deg, ${skill.gradient[0]}10, ${skill.gradient[1]}20)`
        }}
        initial={{ opacity: 0.3 }}
        animate={{
          opacity: isHovered ? 0.7 : 0.3,
        }}
        transition={{
          opacity: { duration: 0.3, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" }
        }}
      />

      {/* 3D content container */}
      <motion.div
        className="relative z-10 text-center"
        style={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <motion.div
          className="mb-6 inline-block"
          whileHover={{ scale: 1.1, rotate: 15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="p-4 rounded-full bg-gray-800/50 backdrop-blur-lg">
            {React.cloneElement(skill.icon, {
              className: `text-3xl ${index === 0 ? 'text-green-400' : index === 1 ? 'text-blue-400' : 'text-orange-400'}`,
            })}
          </div>
        </motion.div>

        <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent inline-block"
          style={{ backgroundImage: `linear-gradient(45deg, ${skill.gradient[0]}, ${skill.gradient[1]})` }}>
          {skill.title}
        </h3>

        <p className="text-gray-300 mb-6">
          {skill.description}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {skill.technologies.map((tech, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 backdrop-blur-sm"
              whileHover={{ scale: 1.25 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {React.cloneElement(tech.icon, {
                className: `text-lg ${index === 0 ? 'text-green-400' : index === 1 ? 'text-blue-400' : 'text-orange-400'}`,
              })}
              <span className="text-sm font-medium text-gray-300">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Expertise() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref, // Reference to the timeline container
    offset: ["start end", "end start"] // Track scroll within the container
  });
  const pathHeight = useTransform(scrollYProgress, [0.15, 0.8], ['0%', '100%']);

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
    <section id="expertise" className="relative pt-10 overflow-visible z-30">
      <CursorGlow />

      {/* Animated logo background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#0A0A0A] overflow-hidden">
        {isClient && [...Array(15)].map((_, i) => {
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-7 pt-14 pb-40">
        <div className="flex justify-center relative px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 sm:mb-12 text-transparent 
       bg-gradient-to-br from-neutral-300 to-neutral-500
       bg-clip-text inline-block w-fit relative"> {/* Added relative here */}
              Technical Expertise
              <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 mx-auto h-1 
            bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-700 
            rounded-full" />
            </h2>
          </motion.div>
        </div>
        {/* from-[#05df72] via-[#3B82F6] to-[#ff8904] */}

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-10 sm:py-20"
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



        <div id='timeline' className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-7 pt-14 overflow-hidden">
          <div className="flex justify-center relative px-4 sm:px-6 lg:px-8">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold sm:mb-12 text-transparent 
       bg-gradient-to-r from-neutral-300 to-neutral-500 
       bg-clip-text inline-block w-fit relative">
                My Journey
                <div
                  className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 mx-auto h-1 
        bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-700 
        rounded-full"
                />
              </h2>
            </motion.div>
          </div>

          <div ref={ref} className="relative pt-20 sm:pt-30">
            {/* Timeline Path */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-1 h-full rounded-full bg-gradient-to-b from-indigo-300 via-indigo-500 to-indigo-700 z-0"
              style={{ height: pathHeight }}
              transition={{ duration: 1.5, ease: "circInOut" }} // Slower animation
            />

            {/* Cards Container */}
            <div className="relative z-10 space-y-16">
              {timelineData.map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }} // Trigger earlier
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                    damping: 25
                  }}
                >
                  {/* Content Card */}
                  <motion.div
                    className={`w-full sm:w-5/6 md:w-2/3 p-4 sm:p-6 rounded-3xl shadow-2xl relative z-20 backdrop-blur-lg border border-gray-800 overflow-visible ${index % 2 === 0 ? 'ml-4 sm:ml-8' : 'mr-4 sm:mr-8'}`}
                    style={{ perspective: '1000px' }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)"
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-lg shadow-lg flex items-center justify-center">
                      <motion.div
                        className="w-8 h-8 rounded-full bg-[#5F6BEB] flex items-center justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {item.icon === 'work' ?
                          <Briefcase className="w-5 h-5 text-white" /> :
                          <GraduationCap className="w-5 h-5 text-white" />
                        }
                      </motion.div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-800/50 backdrop-blur-lg text-white">
                          {item.year}
                        </span>
                        <span className="font-semibold text-base md:text-lg text-[#8EBAFF] 
                        hover:text-[#6366F1] transition-colors duration-200">
                          {item.company}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(45deg, #6366F1, #10B981)' }}>
                        {item.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>

  );
}