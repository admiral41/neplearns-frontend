"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  Award,
  Video,
  Users,
  BookOpen,
  Clock,
  Shield,
  Target,
  MessageCircle,
  Globe,
  Laptop,
} from "lucide-react";
import { whyChooseUs as staticFeatures } from "@/lib/constants/data";
import { FadeUp } from "@/components/animations";
import { useSettings } from "@/lib/providers/SettingsProvider";
import { usePublicFeatures } from "@/lib/hooks/useFeatures";

const iconMap = {
  GraduationCap: GraduationCap,
  Award: Award,
  Video: Video,
  Users: Users,
  BookOpen: BookOpen,
  Clock: Clock,
  Shield: Shield,
  Target: Target,
  MessageCircle: MessageCircle,
  Globe: Globe,
  Laptop: Laptop,
};

function FeatureCard({ feature }) {
  const Icon = iconMap[feature.icon] || BookOpen;

  return (
    <div className="group">
      <Card className="border border-slate-200 hover:border-slate-300 transition-colors bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            {/* Icon - Simplified */}
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-slate-600" />
            </div>
            
            {/* Title */}
            <CardTitle className="text-lg font-medium text-slate-800">
              {feature.title}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-slate-500 leading-relaxed">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCardSkeleton() {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

export default function WhyChooseUs() {
  const { getPlatformName } = useSettings();
  const { data, isLoading, error } = usePublicFeatures();

  const features = data?.features?.length > 0 ? data.features : staticFeatures;
  const sectionContent = data?.section || {
    title: "Why {platformName}?",
    subtitle: "A better way to learn for SEE and +2 students"
  };

  const displayTitle = sectionContent.title?.replace(
    "{platformName}",
    getPlatformName()
  );

  return (
    <section id="about" className="py-20 bg-slate-50 ">
      <div className="container mx-auto px-4">
        {/* Section Header - Minimal */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 block">
            Our Advantages
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4">
            {displayTitle}
          </h2>
          <p className="text-slate-500">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* Features Grid - Clean 3-column layout */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <FeatureCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.slice(0, 6).map((feature) => (
              <motion.div
                key={feature._id || feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <FeatureCard feature={feature} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}