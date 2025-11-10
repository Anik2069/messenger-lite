"use client";

import React from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";

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
  isOpen?: boolean;
  slide?: boolean;
  overlay?: boolean; // new: for dim background
  fixedRight?: boolean; // new: for side drawer mode
  onClose?: () => void; // optional close on overlay click
}

const animationVariants: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: { delay: custom, duration: 0.4, ease: "easeOut" },
    }),
    exit: { opacity: 0 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom, duration: 0.4, ease: "easeOut" },
    }),
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom, duration: 0.4 },
    }),
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom, duration: 0.4 },
    }),
    exit: { opacity: 0, x: 20 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom, duration: 0.4 },
    }),
    exit: { opacity: 0, x: -20 },
  },
  zoomIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.4, ease: "backOut" },
    }),
    exit: { scale: 0.8, opacity: 0 },
  },
  pop: {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.3, ease: "backOut" },
    }),
    exit: { scale: 0, opacity: 0 },
  },
  growIn: {
    hidden: { scale: 0.7, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: custom, duration: 0.4 },
    }),
    exit: { scale: 0.7, opacity: 0 },
  },
};

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  type = "slideUp",
  delay = 0,
  duration = 0.4,
  className = "",
  isOpen = false,
  slide = false,
  overlay = false,
  fixedRight = false,
  onClose,
}) => {
  const variants = animationVariants[type] || animationVariants.fade;

  // ✅ Floating Right Drawer Mode
  if (fixedRight) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              // exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className={`${className}`}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ✅ Regular slide / mount animation
  if (slide) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            custom={delay}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration }}
            className={`h-full ${className}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ✅ Simple appear animation (always mounted)
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
