"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Clock,
  GraduationCap,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  FadeUp,
  SlideIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations";

const iconMap = {
  "🎯": Target,
  "⏰": Clock,
  "👨‍🏫": GraduationCap,
  "📈": TrendingUp,
  "🔄": RefreshCw,
};

const tutoringBenefits = [
  {
    id: 1,
    icon: "🎯",
    title: "100% Personalized Curriculum",
    description:
      "Learning plan designed specifically for your child's needs and pace",
  },
  {
    id: 2,
    icon: "⏰",
    title: "Flexible Timing",
    description:
      "Choose class times that suit your schedule - morning, evening, or weekends",
  },
  {
    id: 3,
    icon: "👨‍🏫",
    title: "Expert Teachers",
    description:
      "Experienced tutors with proven track records and subject expertise",
  },
  {
    id: 4,
    icon: "📈",
    title: "Progress Tracking",
    description:
      "Regular assessments and detailed progress reports for parents",
  },
  {
    id: 5,
    icon: "🔄",
    title: "Instant Doubt Clearing",
    description: "Ask questions anytime during class, no waiting for your turn",
  },
];

const tutoringFeatures = [
  "One-on-one live video sessions",
  "Personalized study material",
  "Flexible scheduling",
  "Weekly progress reports",
  "WhatsApp doubt support",
  "Free demo class available",
];

export default function PrivateTutoring() {
  return (
    <section
      id="tutoring"
      className="py-16 md:py-24 bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="tutoring-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="11" cy="11" r="7" fill="white" fillOpacity="0.3" />
              <circle cx="59" cy="43" r="7" fill="white" fillOpacity="0.3" />
              <circle cx="16" cy="36" r="3" fill="white" fillOpacity="0.3" />
              <circle cx="79" cy="67" r="3" fill="white" fillOpacity="0.3" />
              <circle cx="34" cy="90" r="3" fill="white" fillOpacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tutoring-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <FadeUp className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-950 border-yellow-500/30 hover:from-yellow-300 hover:to-yellow-500 shadow-lg shadow-yellow-500/20 font-semibold">
              Premium Service
            </Badge>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            One-to-One Private Tutoring
          </h2>
          <p className="text-lg text-white/90">
            Personalized attention with dedicated teachers. Perfect for students
            who need extra help or want to excel beyond the classroom.
          </p>
        </FadeUp>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Benefits List */}
          <SlideIn direction="left" className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Why Choose{" "}
              <span className="text-yellow-300">Private Tutoring?</span>
            </h3>

            <StaggerContainer className="space-y-4" staggerDelay={0.1}>
              {tutoringBenefits.map((benefit, index) => {
                const Icon = iconMap[benefit.icon];
                return (
                  <StaggerItem key={benefit.id}>
                    <motion.div
                      className="flex items-start gap-4"
                      whileHover={{ x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0"
                      >
                        {Icon ? (
                          <Icon className="w-5 h-5 text-yellow-300" />
                        ) : (
                          <span className="text-xl">{benefit.icon}</span>
                        )}
                      </motion.div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-white/80 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </SlideIn>

          {/* Pricing Card */}
          <SlideIn direction="right">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="relative overflow-hidden">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 right-4"
                >
                  <Badge className="bg-red-50 text-red-600 hover:bg-red-100">
                    ✨ Most Effective
                  </Badge>
                </motion.div>

                <CardContent className="pt-12 pb-8 text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    1:1 Live Tutoring
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Personal teacher for your child
                  </p>

                  <StaggerContainer
                    className="grid grid-cols-2 gap-3 mb-8 text-left"
                    staggerDelay={0.05}
                    delay={0.3}
                  >
                    {tutoringFeatures.map((feature, index) => (
                      <StaggerItem key={index}>
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 25,
                              delay: 0.4 + index * 0.05,
                            }}
                            className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
                          >
                            <span className="text-green-600 text-xs">✓</span>
                          </motion.div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        document
                          .querySelector("#contact")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Book Free Demo Class →
                    </Button>
                  </motion.div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Package discounts available
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </SlideIn>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="absolute top-20 right-10 w-20 h-20 bg-white/5 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute bottom-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"
      />
    </section>
  );
}
