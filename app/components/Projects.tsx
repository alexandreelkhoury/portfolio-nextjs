'use client';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import Image from 'next/image';
import projects from '../data/projects';
// import TimelineDemo from './ProjectsData'; // Removed - using TimelineModern instead

interface Project {
  img: string;
  title: string;
  url: string;
  tech: string[];
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [buttonText, setButtonText] = useState('Live Demo');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['0 1', '1.33 1'] });

  // Simple scroll animations
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  // Simple tech stack animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className="group relative h-[300px] xs:h-[340px] sm:h-[380px] md:h-[420px] lg:h-[480px] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 hover:border-white/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      {/* Optimized Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={project.img}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 2}
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col justify-end p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Simple Title */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.2 + index * 0.1,
            duration: 0.5
          }}
          className={`text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-300 mb-2 sm:mb-3 md:mb-4 transition-colors duration-300 group-hover:text-white`}
        >
          {project.title}
        </motion.h3>

        {/* Tech Stack & Button */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={isHovered ? "show" : "hidden"}
          className="flex justify-between items-center"
        >
          {/* Simple Tech Stack */}
          <motion.div className="flex gap-1 sm:gap-2 md:gap-3 flex-wrap max-w-[60%]" variants={container}>
            {project.tech.slice(0, 4).map((tech, i) => (
              <motion.span
                key={tech}
                variants={item}
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-[10px] xs:text-xs sm:text-sm rounded-full bg-white/15 text-gray-200 backdrop-blur-sm border border-white/10 font-medium hover:bg-white/20 transition-colors duration-200"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>

          {/* Simple Button */}
          <motion.a
            href={project.url}
            target="_blank"
            className="relative flex items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-medium text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all duration-200 flex-shrink-0"
            onHoverStart={() => setButtonText('Launch 🚀')}
            onHoverEnd={() => setButtonText('Live Demo')}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={buttonText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {buttonText}
              </motion.span>
            </AnimatePresence>
            <svg
              className="w-3 sm:w-4 h-3 sm:h-4 transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  return (
    <section id="projects" className="bg-[#0A0A0A] pb-16 sm:pb-20">
      <div className="container relative mx-auto px-4 sm:px-6 pt-16 sm:pt-20">
        {/* <TimelineDemo/> */}
        {/* Section Title */}
        <div className="flex justify-center mb-12 sm:mb-16 md:mb-20">
          <motion.div
            className="relative text-center max-w-2xl px-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-transparent 
             bg-gradient-to-br from-neutral-300 to-neutral-500
             bg-clip-text inline-block relative">
              Featured Projects
              <div className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 right-0 mx-auto h-0.5 sm:h-1 
              bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-700 
              rounded-full"
              />
            </h2>
          </motion.div>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;