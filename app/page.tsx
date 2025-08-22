'use client';
import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import DemoHeroGeometric from './components/DemoHeroGeometric';
import ProjectsShowcase from './components/ProjectsShowcase';
import Expertise from './components/Expertise';
import Loader from './components/Loader';
import SplineSceneBasic from './components/Robot';
import ScrollToTop from './components/ScrollToTop';
import { User, Briefcase, FileText } from 'lucide-react'
import TimelineModern from './components/TimelineModern';
import { NavBar } from "@/components/ui/tubelight-navbar"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const navItems = [
    { name: 'Home', url: '#'},
    { name: 'Expertise', url: '#expertise'},
    { name: 'Timeline', url: '#timeline' },
    { name: 'Projects', url: '#projects' }
  ]  

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 768); // 768px is the breakpoint for 'md'
  };

  useEffect(() => {
    handleResize(); // Check screen size on mount
    window.addEventListener('resize', handleResize); // Update on resize
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="transition-container">
      {isLoading && <Loader />}
      <main
        className={`content ${isLoading ? 'hidden' : 'visible'} space-y-0`}
        style={{
          opacity: isLoading ? 0 : 1,
          transitionDelay: isLoading ? '0s' : '0.3s'
        }}
      >
        
        {/* <DemoHeroGeometric /> */}
        <NavBar items={navItems} />
        
        {isLargeScreen && <ScrollToTop />}
        <SplineSceneBasic />
        {/* <Hero /> */}
        <Expertise />
        <ProjectsShowcase />
        <TimelineModern />
        
      </main>
    </div>
  );
}