"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Clock, Users, BookOpen } from "lucide-react";
import { useCourses } from "@/lib/hooks/useCourses";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/animations";

function CourseCard({ course }) {
  const originalPrice = course.price || 0;
  const finalPrice = course.finalPrice ?? (originalPrice - (originalPrice * (course.discount || 0)) / 100);
  const hasDiscount = course.discount > 0 && course.learn_type === "PAID";
  const isFree = course.learn_type === "FREE";

  return (
    <Link href={`/courses/${course.courseSlug || course._id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300 bg-white">
        {/* Image Container */}
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          {course.image ? (
            <img
              src={course.image.startsWith("http") ? course.image : `${process.env.NEXT_PUBLIC_API_URL}/${course.image}`}
              alt={course.courseTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-slate-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isFree ? (
              <Badge className="bg-emerald-500 text-white border-0 px-3 py-1">
                Free
              </Badge>
            ) : hasDiscount && (
              <Badge className="bg-slate-700 text-white border-0 px-3 py-1">
                {course.discount}% off
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-medium text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-slate-600 transition-colors">
            {course.courseTitle}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-slate-500 mb-3">
            {course.lecturers?.[0]?.user?.firstname
              ? `${course.lecturers[0].user.firstname} ${course.lecturers[0].user.lastname || ''}`
              : 'Expert Instructor'}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{course.duration || 0}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{course.totalEnrollments || 0} students</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            {isFree ? (
              <span className="text-lg font-medium text-emerald-600">Free</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-slate-800">
                  Rs. {finalPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    Rs. {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="border border-slate-200 bg-white">
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
    </Card>
  );
}

export default function Courses() {
  const scrollRef = useRef(null);
  const { data, isLoading, error } = useCourses({ limit: 8 });

  const courses = data?.data || [];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header - Minimal */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 block">
            Featured Courses
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4">
            Popular Learning Paths
          </h2>
          <p className="text-slate-500">
            Carefully crafted courses for SEE and +2 students
          </p>
        </div>

        {/* Course Grid/Carousel */}
        <div className="relative">
          {/* Navigation - Only show if there are courses */}
          {courses.length > 4 && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow hidden lg:flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow hidden lg:flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Loading State */}
            {isLoading && (
              <>
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-[280px]">
                    <CourseCardSkeleton />
                  </div>
                ))}
              </>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="w-full text-center py-12">
                <p className="text-slate-500">
                  Unable to load courses. Please try again.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && courses.length === 0 && (
              <div className="w-full text-center py-12">
                <p className="text-slate-500">
                  Courses coming soon. Stay tuned!
                </p>
              </div>
            )}

            {/* Courses */}
            {!isLoading &&
              courses.map((course) => (
                <div
                  key={course._id}
                  className="flex-shrink-0 w-[280px]"
                >
                  <CourseCard course={course} />
                </div>
              ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
          >
            Browse all courses
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}