'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { timelineData } from '../data/timeline.js';

interface TimelineItem {
  year: string;
  title: string;
  company: string;
  description: string;
  icon: string;
}

const TimelineCard = ({ item, index }: { item: TimelineItem; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['0 1', '1.2 1']
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  const isEven = index % 2 === 0;

  const getCompanyLogo = (company: string) => {
    const logoMap: { [key: string]: string } = {
      'Sovra': '/images/sovra-logo.svg',
      'Metav.rs': '/images/logo-metav.rs.jpg',
      'Ambrosia': '/images/ambrosia-logo.jpeg',
      'ESGI': '/images/ESGI-logo.jpeg',
      'Alyra': '/images/alyra-logo.png',
      'Université de Paris': '/images/université-de-paris-logo.png',
      'Freelance': '/images/SPL_Logo.png' // Using SPL logo for freelance work
    };
    return logoMap[company] || '/images/chainlink-logo.png';
  }; 

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, y, scale }}
      className={`flex items-center gap-8 md:gap-12 lg:gap-16 mb-16 md:mb-20 lg:mb-24 ${
        isEven ? 'flex-row' : 'flex-row-reverse'
      } max-md:flex-col`}
    >
      {/* Timeline Line & Dot */}
      <div className="hidden md:flex flex-col items-center relative">
        {/* Connecting Line */}
        {index !== timelineData.length - 1 && (
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="absolute top-16 w-0.5 bg-gradient-to-b from-neutral-400 to-neutral-600 z-0"
            style={{ height: '200px' }}
          />
        )}
        
        {/* Timeline Dot */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          whileInView={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          className="w-4 h-4 rounded-full bg-gradient-to-r from-neutral-300 to-neutral-500 shadow-lg z-10 relative"
        >
          {/* Pulsing Effect */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-neutral-400"
          />
        </motion.div>
      </div>

      {/* Content Card */}
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="flex-1 max-w-2xl text-left"
      >
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all duration-500 relative overflow-hidden">
          
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.01] to-transparent" />
          
          {/* Year Badge */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-4 text-sm font-mono text-neutral-300"
          >
            <div className={`w-2 h-2 rounded-full ${
              item.icon === 'work' ? 'bg-green-400' : 'bg-blue-400'
            }`} />
            {item.year}
          </motion.div>

          {/* Company Logo & Title */}
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white/5 flex-shrink-0"
            >
              <Image
                src={getCompanyLogo(item.company)}
                alt={item.company}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl font-bold text-white mb-1"
              >
                {item.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-neutral-400 font-medium"
              >
                {item.company}
              </motion.p>
            </div>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-neutral-300 leading-relaxed text-sm md:text-base"
          >
            {item.description}
          </motion.p>

          {/* Icon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
          >
            {item.icon === 'work' ? (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3a2 2 0 00-2-2h-4a2 2 0 00-2-2v4h8V3z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </motion.div>
          
          {/* Hover Effect */}
          <motion.div
            initial={{ x: isEven ? '-100%' : '100%' }}
            whileHover={{ x: isEven ? '100%' : '-100%' }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const TimelineModern = () => {
  return (
    <section id="timeline" className="bg-[#0A0A0A] pt-4 sm:pt-8 pb-8 sm:pb-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-transparent bg-gradient-to-br from-neutral-300 to-neutral-500 bg-clip-text inline-block relative"
          >
            Professional Journey
            <div className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 right-0 mx-auto h-0.5 sm:h-1 bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-700 rounded-full" />
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-neutral-400 text-base md:text-lg mt-6 max-w-2xl mx-auto"
          >
            From mathematics student to blockchain developer - my journey through Web3, DeFi, and full-stack development
          </motion.p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-6xl mx-auto">
          
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
          
          {/* Timeline Items */}
          {timelineData.map((item, index) => (
            <TimelineCard key={index} item={item} index={index} />
          ))}
          
          {/* Bottom Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-neutral-500 to-transparent"
          />
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-neutral-500 text-sm">
            Ready to build the future of Web3 together
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TimelineModern;