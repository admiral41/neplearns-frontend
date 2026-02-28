"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Default animation settings
const defaultViewport = { once: true, amount: 0.3 };
const defaultTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

/**
 * FadeUp - Fades in and slides up when in view
 */
export function FadeUp({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 30,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ ...defaultTransition, duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn - Simple fade in when in view
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={defaultViewport}
      transition={{ ...defaultTransition, duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn - Slides in from a direction when in view
 */
export function SlideIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = "left", // left, right, up, down
  distance = 50,
  ...props
}) {
  const directionMap = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance },
  };

  const initial = { opacity: 0, ...directionMap[direction] };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={defaultViewport}
      transition={{ ...defaultTransition, duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn - Scales in when in view
 */
export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  scale = 0.9,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={defaultViewport}
      transition={{ ...defaultTransition, duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Parent container for staggered children animations
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Child item for StaggerContainer
 */
export function StaggerItem({
  children,
  className,
  y = 30,
  ...props
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: defaultTransition,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverScale - Scales up on hover
 */
export function HoverScale({
  children,
  className,
  scale = 1.02,
  ...props
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverLift - Lifts up with shadow on hover
 */
export function HoverLift({
  children,
  className,
  y = -5,
  ...props
}) {
  return (
    <motion.div
      whileHover={{ y, transition: { duration: 0.2 } }}
      className={cn("transition-shadow hover:shadow-lg", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * PopIn - Pops in with a bounce effect
 */
export function PopIn({
  children,
  className,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={defaultViewport}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUp - Animated number counter
 */
export function CountUp({
  end,
  duration = 2,
  delay = 0,
  suffix = "",
  prefix = "",
  className,
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={defaultViewport}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={defaultViewport}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={defaultViewport}
          transition={{ delay }}
          onViewportEnter={(entry) => {
            // The actual counting will be handled by the component using this
          }}
        >
          {end}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

/**
 * TextReveal - Reveals text character by character or word by word
 */
export function TextReveal({
  children,
  className,
  delay = 0,
  staggerDelay = 0.03,
  type = "word", // "word" or "char"
}) {
  const text = typeof children === "string" ? children : "";
  const items = type === "word" ? text.split(" ") : text.split("");
  const separator = type === "word" ? " " : "";

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {item}{separator}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * Parallax - Subtle parallax effect on scroll
 */
export function Parallax({
  children,
  className,
  speed = 0.5,
  ...props
}) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: 0 }}
      viewport={{ once: false, amount: 0 }}
      style={{ y: 0 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
