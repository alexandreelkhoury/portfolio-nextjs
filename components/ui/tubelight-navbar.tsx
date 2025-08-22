"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
}

interface NavBarProps {
  items: NavItem[]
}

export function NavBar({ items }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY
        
        // Show navbar when at top of page
        if (currentScrollY < 10) {
          setIsVisible(true)
        }
        // Hide when scrolling down, show when scrolling up
        else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false)
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true)
        }
        
        setLastScrollY(currentScrollY)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar)
      return () => window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ 
        y: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
      className={cn(
        "fixed top-2 sm:top-3 left-1/2 -translate-x-1/2 z-50 mb-6 w-[90%] sm:w-auto max-w-[380px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-none",
      )}
    >
      <div className="flex items-center justify-center gap-0.5 sm:gap-2 md:gap-3 lg:gap-4 bg-black/30 border border-neutral-600/50 backdrop-blur-xl py-1.5 sm:py-2 px-1.5 sm:px-2 md:px-3 lg:px-4 rounded-full shadow-2xl shadow-black/20 overflow-visible"
           style={{
             background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.9), rgba(31, 31, 31, 0.8))'
           }}>
        {items.map((item) => {
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold px-1.5 xs:px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-1.5 xs:py-2 sm:py-2.5 md:py-3 rounded-full transition-all text-center",
                "flex-1 min-w-0 sm:flex-none sm:min-w-fit",
                "bg-gradient-to-br from-neutral-50 to-neutral-400 bg-clip-text text-transparent",
                "hover:from-neutral-100 hover:to-neutral-300",
                isActive && "!from-neutral-50 !to-neutral-100 font-bold"
              )}
            >
              <span className="navbar-text block whitespace-nowrap overflow-hidden text-ellipsis">
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-neutral-700/20 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-1 xs:-top-2 sm:-top-3 left-1/2 -translate-x-1/2 w-2 xs:w-4 sm:w-8 md:w-10 h-0.5 xs:h-1 sm:h-1.5 bg-gradient-to-r from-neutral-100 to-neutral-300 rounded-t-full">
                    <div className="absolute w-3 xs:w-6 sm:w-12 md:w-16 h-3 xs:h-6 sm:h-8 bg-neutral-400/20 rounded-full blur-sm xs:blur-md sm:blur-lg -top-1 xs:-top-2 sm:-top-3 -left-0.5 xs:-left-1 sm:-left-2 md:-left-3" />
                    <div className="absolute w-2 xs:w-4 sm:w-8 md:w-10 h-3 xs:h-6 sm:h-8 bg-neutral-400/20 rounded-full blur-sm xs:blur-md sm:blur-lg -top-0.5 xs:-top-1 sm:-top-1.5" />
                    <div className="absolute w-1 xs:w-2 sm:w-4 md:w-5 h-2 xs:h-4 sm:h-6 bg-neutral-400/20 rounded-full blur-sm top-0 left-0.5 xs:left-1 sm:left-2 md:left-2.5" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
