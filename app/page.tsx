'use client';
import { useCallback, useEffect, useState } from 'react';
import ProjectsShowcase from './components/ProjectsShowcase';
import Expertise from './components/Expertise';
import SplineSceneBasic from './components/Robot';
import ScrollToTop from './components/ScrollToTop';
import TimelineModern from './components/TimelineModern';
import AboutMe from './components/AboutMe';
import { NavBar } from "@/components/ui/tubelight-navbar"

export default function Home() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const navItems = [
    { name: 'Home', url: '#'},
    { name: 'About', url: '#about'},
    { name: 'Expertise', url: '#expertise'},
    { name: 'Journey', url: '#timeline' },
    { name: 'Projects', url: '#projects' }
  ]

  const handleResize = useCallback(() => {
    setIsLargeScreen(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    handleResize();
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  return (
    <main>
      <NavBar items={navItems} />
      {isLargeScreen && <ScrollToTop />}
      <SplineSceneBasic />
      <AboutMe />
      <Expertise />
      <TimelineModern />
      <ProjectsShowcase />
    </main>
  );
}