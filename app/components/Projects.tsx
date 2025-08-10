'use client';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import projects from '../data/projects';
import TimelineDemo from './ProjectsData'; // Adjust the path as necessary

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

  // Scroll animations
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Magnetic hover effect
  const x = useMotionValue(0);
  const yBtn = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(yBtn, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    x.set((relX - rect.width / 2) * 0.05);
    yBtn.set((relY - rect.height / 2) * 0.05);
  };

  // Tech stack stagger animation
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      ref={ref}
      style={{ scale, y, opacity }}
      className="group relative h-[280px] xs:h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent transition-all duration-500 hover:shadow-2xl hover:shadow-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Image Layer */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={project.img}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col justify-end p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className={`text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-300 mb-2 sm:mb-3 md:mb-4 transition-colors duration-300`}
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
          {/* Tech Stack */}
          <motion.div className="flex gap-1 sm:gap-2 md:gap-3 flex-wrap max-w-[60%]" variants={container}>
            {project.tech.slice(0, 4).map((tech, i) => (
              <motion.span
                key={tech}
                variants={item}
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-[10px] xs:text-xs sm:text-sm rounded-full bg-white/15 text-gray-200 backdrop-blur-sm border border-white/10 font-medium hover:bg-white/20 transition-colors duration-300"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>

          {/* Magnetic Button */}
          <motion.a
            href={project.url}
            target="_blank"
            className="relative flex items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm font-medium text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 flex-shrink-0"
            style={{ x: xSpring, y: ySpring }}
            onHoverStart={() => setButtonText('Launch 🚀')}
            onHoverEnd={() => setButtonText('Live Demo')}
            whileHover={{ scale: typeof window !== 'undefined' && window.innerWidth >= 768 ? 1.05 : 1.02 }}
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
            <motion.svg
              className="w-3 sm:w-4 h-3 sm:h-4 transition-transform duration-300 group-hover:animate-bounce"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V12m-2.25-7.5l-5.166 5.166a1.5 1.5 0 01-2.121-.001L5.25 8.25M12 21h7.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6.75v10.5a2.25 2.25 0 002.25 2.25h7.5" />
            </motion.svg>
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

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
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