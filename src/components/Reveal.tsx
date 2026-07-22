'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface RevealProps {
  children: React.ReactNode;
  type?: 'zoom' | 'left' | 'right' | 'up' | 'none';
  delay?: number;
  className?: string;
}

export function Reveal({ children, type = 'up', delay = 0, className = '' }: RevealProps) {
  const variants = {
    hidden: {
      opacity: 0,
      y: type === 'up' ? 34 : type === 'zoom' ? 18 : 0,
      x: type === 'left' ? -44 : type === 'right' ? 44 : 0,
      scale: type === 'zoom' ? 0.94 : 1,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8%' }}
      variants={variants}
      transition={{
        duration: 0.9,
        ease: [0.2, 0, 0, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  delayStep?: number;
}

export function RevealGroup({ children, className = '', delayStep = 0.09 }: RevealGroupProps) {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => {
        const delay = Math.min(index * delayStep, 0.42);
        const yOffset = 28 + Math.min(index, 4) * 5;
        const scaleOffset = 0.982 - Math.min(index, 3) * 0.004;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: yOffset, scale: scaleOffset, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{
              duration: 0.9,
              ease: [0.2, 0, 0, 1],
              delay,
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  )
}
