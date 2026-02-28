"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { testimonials as fallbackTestimonials } from "@/lib/constants/data";
import { useSuccessStories } from "@/lib/hooks/useSuccessStories";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import { FadeUp } from "@/components/animations";
import { useSettings } from "@/lib/providers/SettingsProvider";

function TestimonialSkeleton() {
  return (
    <div className="h-full rounded-lg border bg-background p-5">
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-4 h-4" />
        ))}
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex items-center gap-3 pt-4 border-t">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { getPlatformName } = useSettings();
  const plugin = useRef(
    AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const { data, isLoading } = useSuccessStories();

  // Use API data if available, otherwise fall back to static data
  const testimonials = data?.data?.length > 0 ? data.data : fallbackTestimonials;

  // Get image URL - handle both API and fallback data structures
  const getImageUrl = (testimonial) => {
    // API data uses 'photo', fallback uses 'image'
    const photo = testimonial.photo || testimonial.image;
    if (!photo) return null;

    // If it's already a full URL or starts with /, return as is
    if (photo.startsWith("http") || photo.startsWith("/")) {
      return photo;
    }
    // Otherwise prepend the API URL for uploaded images
    return `${process.env.NEXT_PUBLIC_API_URL}/${photo}`;
  };

  // Get testimonial text - handle both data structures
  const getText = (testimonial) => testimonial.content || testimonial.text || "";

  // Get designation/role - handle both data structures
  const getDesignation = (testimonial) => testimonial.designation || testimonial.role || "";

  // Get rating - default to 5 if not present
  const getRating = (testimonial) => testimonial.rating || 5;

  if (testimonials.length === 0 && !isLoading) return null;

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <FadeUp className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from our students who achieved their academic goals with {getPlatformName()}
          </p>
        </FadeUp>

        {/* Testimonials Carousel */}
        <div className="relative">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <TestimonialSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[plugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial) => (
                  <CarouselItem
                    key={testimonial._id || testimonial.id}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                      className="h-full rounded-lg border bg-background p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/50"
                    >
                      {/* Rating Stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(getRating(testimonial))].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <blockquote className="text-muted-foreground italic leading-relaxed mb-4 line-clamp-4">
                        "{getText(testimonial)}"
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        {getImageUrl(testimonial) ? (
                          <img
                            src={getImageUrl(testimonial)}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl font-bold">
                            {testimonial.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">
                            {testimonial.name}
                          </h4>
                          {getDesignation(testimonial) && (
                            <p className="text-sm text-muted-foreground truncate">
                              {getDesignation(testimonial)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}

          {/* Gradient Overlays for smooth edges */}
          {!isLoading && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-secondary/5 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-secondary/5 to-transparent" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
