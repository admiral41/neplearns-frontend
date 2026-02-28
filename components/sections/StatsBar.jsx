"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { platformStats } from "@/lib/constants/data";
import { FadeUp } from "@/components/animations";

function AnimatedCounter({ end, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0.1, // Reduced bounce for more professional feel
  });

  const display = useTransform(spring, (val) =>
    Math.floor(val).toLocaleString()
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(end);
      setHasAnimated(true);
    }
  }, [isInView, spring, end, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section className="py-16 md:py-20 bg-slate-50 relative overflow-hidden">
      {/* Clean background - removed flashy gradients */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header - Simplified */}
        <FadeUp className="text-center mb-12 md:mb-16">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 block">
            Our Impact
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-3">
            Growing with Nepal
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Real numbers from our learning community
          </p>
        </FadeUp>

        {/* Stats Grid - Clean professional cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {platformStats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:border-slate-300 transition-colors"
            >
              <div className="text-3xl md:text-4xl font-light text-slate-800 mb-2">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2}
                />
              </div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators - simple and professional */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-400">
            Trusted by students across all 7 provinces of Nepal
          </p>
        </motion.div>
      </div>
    </section>
  );
}