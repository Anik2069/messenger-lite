// components/reusable/animations/AnimatedWrapper.tsx
"use client";

import { motion, Variants } from "framer-motion";
import React from "react";

interface AnimatedWrapperProps {
  type?:
    | "fade"
    | "slideUp"
    | "scale"
    | "zoomIn"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "flipX"
    | "flipY"
    | "rotateIn"
    | "pop"
    | "bounce"
    | "drop"
    | "grow"
    | "shrink"
    | "fadeFromTop"
    | "fadeFromBottom"
    | "fadeFromLeft"
    | "fadeFromRight"
    | "growIn";
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

const animationVariants: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: { delay: custom, duration: 0.4, ease: "easeOut" },
    }),
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom, duration: 0.4, ease: "easeOut" },
    }),
  },
  scale: {
    hidden: { scale: 0.95, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.4 },
    }),
  },
  zoomIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.4, ease: "backOut" },
    }),
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom, duration: 0.4 },
    }),
  },
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom, duration: 0.4 },
    }),
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom, duration: 0.4 },
    }),
  },
  flipX: {
    hidden: { rotateX: 90, opacity: 0 },
    visible: (custom: number) => ({
      rotateX: 0,
      opacity: 1,
      transition: { delay: custom, duration: 0.5 },
    }),
  },
  flipY: {
    hidden: { rotateY: 90, opacity: 0 },
    visible: (custom: number) => ({
      rotateY: 0,
      opacity: 1,
      transition: { delay: custom, duration: 0.5 },
    }),
  },
  rotateIn: {
    hidden: { rotate: -180, opacity: 0 },
    visible: (custom: number) => ({
      rotate: 0,
      opacity: 1,
      transition: { delay: custom, duration: 0.5 },
    }),
  },
  pop: {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.3, ease: "backOut" },
    }),
  },
  bounce: {
    hidden: { y: -30, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: custom, duration: 0.5, ease: "bounceOut" },
    }),
  },
  drop: {
    hidden: { y: -40, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: custom, duration: 0.3 },
    }),
  },
  grow: {
    hidden: { scaleY: 0, opacity: 0 },
    visible: (custom: number) => ({
      scaleY: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.4 },
    }),
  },
  shrink: {
    hidden: { scale: 1.2, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.4 },
    }),
  },
  fadeFromTop: {
    hidden: { opacity: 0, y: -10 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom, duration: 0.3 },
    }),
  },
  fadeFromBottom: {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom, duration: 0.3 },
    }),
  },
  fadeFromLeft: {
    hidden: { opacity: 0, x: -10 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom, duration: 0.3 },
    }),
  },
  fadeFromRight: {
    hidden: { opacity: 0, x: 10 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom, duration: 0.3 },
    }),
  },
  growIn: {
    hidden: { scale: 0.7, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.4 },
    }),
  },
};

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  type = "slideUp",
  delay = 0,
  duration = 0.4,
  className,
}) => {
  const variants = animationVariants[type];

  return (
    <motion.div
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper;
