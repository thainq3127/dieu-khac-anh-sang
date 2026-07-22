'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export default function Parallax({ children, strength = 20, className = '' }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track the scroll progress of the container relative to the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress (0 to 1) to vertical transform offset (strength to -strength)
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden is-parallax-frame ${className}`}
    >
      <motion.div 
        style={{ y }} 
        className="w-full h-full scale-[1.15] origin-center relative"
      >
        {children}
      </motion.div>
    </div>
  )
}
