"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { heroSlides } from "@/lib/constants/data";
import { useSettings } from "@/lib/providers/SettingsProvider";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

export default function HeroSlider() {
  const { getWhatsappUrl } = useSettings();
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);

  const plugin = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false })
  );

  const gradients = [
    "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800",
    "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700",
  ];

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);
  const scrollTo = useCallback((index) => api?.scrollTo(index), [api]);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        plugins={[plugin.current]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {heroSlides.map((slide, index) => (
            <CarouselItem key={slide.id} className="pl-0 relative">
              {/* Clean gradient background */}
              <div className={cn(
                "absolute inset-0 transition-opacity duration-700",
                gradients[index % gradients.length]
              )} />

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />

              {/* Content */}
              <div className="relative z-10 min-h-screen flex items-center py-20">
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto text-center">
                    {/* Platform name - subtle */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mb-6"
                    >
                      <span className="text-sm font-medium tracking-wider text-white/60 uppercase">
                        NepLearn
                      </span>
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6"
                    >
                      {slide.title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-lg text-white/70 max-w-2xl mx-auto mb-8"
                    >
                      {slide.subtitle}
                    </motion.p>

                    {/* CTA Buttons - WhatsApp now clearly visible */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                      <Button
                        size="lg"
                        className="bg-white text-slate-900 px-8 py-6 text-base font-medium min-w-[200px] transition-all hover:bg-white/90"
                        asChild
                      >
                        <Link href={slide.ctaLink}>
                          {slide.cta}
                        </Link>
                      </Button>
                      
                      <Button
                        size="lg"
                        className="bg-[#25D366] text-white px-8 py-6 text-base font-medium min-w-[200px] transition-none border-2 border-white/20 shadow-lg"
                        asChild
                      >
                        <a
                          href={getWhatsappUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Contact Us on WhatsApp
                        </a>
                      </Button>
                    </motion.div>

                    {/* Simple stats line */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="mt-12 pt-8 border-t border-white/10"
                    >
                      <div className="flex justify-center gap-8 text-sm">
                        <div>
                          <span className="text-white font-medium">5000+</span>
                          <span className="text-white/50 ml-2">Students</span>
                        </div>
                        <div>
                          <span className="text-white font-medium">50+</span>
                          <span className="text-white/50 ml-2">Courses</span>
                        </div>
                        <div>
                          <span className="text-white font-medium">15+</span>
                          <span className="text-white/50 ml-2">Instructors</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Minimal navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
        <button
          onClick={scrollPrev}
          className="p-2 text-white/50 hover:text-white/90 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "transition-all",
                current === index
                  ? "text-white text-sm font-medium"
                  : "text-white/30 hover:text-white/50 text-sm"
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              0{index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={scrollNext}
          className="p-2 text-white/50 hover:text-white/90 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Very subtle background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}