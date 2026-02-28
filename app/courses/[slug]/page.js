"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Clock,
  Users,
  Video,
  Star,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  GraduationCap,
  Target,
  Award,
  Globe,
  FileText,
  User,
  Calendar,
  TrendingUp,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
import { cn } from "@/lib/utils";

export default function PublicCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchCourseDetails();
    }
  }, [slug]);

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const courseResponse = await courseAPI.getCourseBySlug(slug);
      const courseData = courseResponse.data;
      setCourse(courseData);

      // Fetch curriculum (weeks and lessons)
      if (courseData._id) {
        try {
          const weeksResponse = await weekAPI.getWeeksByCourse(courseData._id);
          const weeksData = weeksResponse.data || [];
          setWeeks(weeksData);

          // Fetch lessons for each week
          const allLessons = [];
          for (const week of weeksData) {
            try {
              const lessonsResponse = await lessonAPI.getWeekLessons(week._id);
              if (lessonsResponse.data) {
                const weekLessons = lessonsResponse.data.map((lesson) => ({
                  ...lesson,
                  weekNumber: week.weekNumber,
                  weekTitle: week.weekTitle,
                }));
                allLessons.push(...weekLessons);
              }
            } catch (err) {
              console.error(`Error fetching lessons for week ${week.weekNumber}:`, err);
            }
          }
          setLessons(allLessons);
        } catch (err) {
          console.error("Error fetching curriculum:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      setError("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollClick = () => {
    // Redirect to login with course slug as redirect param
    router.push(`/login?redirect=/student-dashboard/courses/${slug}`);
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 pt-16 flex items-center justify-center">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Course Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/courses">
              <Button>Browse All Courses</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const rating = course.rating || 4.5;
  const originalPrice = course.price || 0;
  const finalPrice =
    course.finalPrice ??
    originalPrice - (originalPrice * (course.discount || 0)) / 100;
  const hasDiscount = course.discount > 0 && course.learn_type === "PAID";
  const isFree = course.learn_type === "FREE";
  const videoId = course.embeddedUrl ? extractYouTubeVideoId(course.embeddedUrl) : null;
  const totalLessons = lessons.length || course.totalLessons || 0;
  const totalDuration = course.duration || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#003893] to-[#002266] text-white pt-24 pb-8 md:pt-28 md:pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              {/* Course Info */}
              <div>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-blue-200 mb-4">
                  <Link href="/courses" className="hover:text-white transition">
                    Courses
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-white">
                    {course.category?.categoryName || "Course"}
                  </span>
                </nav>

                {/* Category Badge */}
                <Badge className="bg-white/20 text-white hover:bg-white/30 mb-4">
                  {course.category?.categoryName || "Course"}
                </Badge>

                {/* Title */}
                <h1 className="text-2xl md:text-4xl font-bold mb-4">
                  {course.courseTitle}
                </h1>

                {/* Short Description */}
                <p className="text-lg text-blue-100 mb-6 line-clamp-3">
                  {course.courseShortDesc || course.courseDesc}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">
                      {rating.toFixed(1)}
                    </span>
                    <div className="flex">{renderStars(rating)}</div>
                    {course.totalEnrollments > 0 && (
                      <span className="text-blue-200">
                        ({course.totalEnrollments} students)
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Created by</p>
                    <p className="font-medium">
                      {course.lecturers?.[0]?.user?.firstname
                        ? `${course.lecturers[0].user.firstname} ${course.lecturers[0].user.lastname || ""}`
                        : "Expert Instructor"}
                    </p>
                  </div>
                </div>

                {/* Quick Stats - Mobile */}
                <div className="grid grid-cols-3 gap-4 mt-6 lg:hidden">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">{totalDuration}h</p>
                    <p className="text-xs text-blue-200">Duration</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <Video className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">{totalLessons}</p>
                    <p className="text-xs text-blue-200">Lessons</p>
                  </div>
                  {course.totalEnrollments > 0 ? (
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <Users className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-sm font-medium">{course.totalEnrollments}</p>
                      <p className="text-xs text-blue-200">Students</p>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <GraduationCap className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-sm font-medium">{course.weekly_study || 5}h</p>
                      <p className="text-xs text-blue-200">Weekly</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Course Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* What You'll Learn */}
                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-[#003893] dark:text-blue-400" />
                        What You'll Learn
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.learningOutcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Course Description */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-[#003893] dark:text-blue-400" />
                      About This Course
                    </h2>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {course.courseDesc || "No description available."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Curriculum */}
                {weeks.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#003893] dark:text-blue-400" />
                        Course Curriculum
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span>{weeks.length} weeks</span>
                        <span>•</span>
                        <span>{totalLessons} lessons</span>
                        <span>•</span>
                        <span>{totalDuration}h total</span>
                      </div>

                      <Accordion type="multiple" className="w-full">
                        {weeks.map((week) => {
                          const weekLessons = lessons.filter(
                            (l) => l.weekNumber === week.weekNumber
                          );

                          return (
                            <AccordionItem
                              key={week._id}
                              value={week._id}
                              className="border rounded-lg mb-2 px-0"
                            >
                              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3 text-left">
                                  <div className="h-8 w-8 rounded-full bg-[#003893]/10 dark:bg-blue-500/20 flex items-center justify-center text-[#003893] dark:text-blue-400 font-bold text-sm">
                                    {week.weekNumber}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      Week {week.weekNumber}: {week.weekTitle || "Lessons"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {weekLessons.length} lessons
                                    </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2 mt-2">
                                  {weekLessons.map((lesson, index) => (
                                    <div
                                      key={lesson._id}
                                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                      <PlayCircle className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                        {index + 1}. {lesson.lessonTitle}
                                      </span>
                                      {lesson.duration && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {lesson.duration} min
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {/* Prerequisites */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#003893] dark:text-blue-400" />
                        Prerequisites
                      </h2>
                      <ul className="space-y-2">
                        {course.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="h-5 w-5 text-[#003893] dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Instructor Section */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-[#003893] dark:text-blue-400" />
                      Your Instructor
                    </h2>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-[#003893]/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="h-8 w-8 text-[#003893] dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {course.lecturers?.[0]?.user?.firstname
                            ? `${course.lecturers[0].user.firstname} ${course.lecturers[0].user.lastname || ""}`
                            : "Expert Instructor"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          Course Instructor
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          Experienced educator dedicated to helping students
                          achieve their academic goals through quality education.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sticky Enrollment Card (Desktop) */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <EnrollmentCard
                    course={course}
                    isFree={isFree}
                    finalPrice={finalPrice}
                    originalPrice={originalPrice}
                    hasDiscount={hasDiscount}
                    totalLessons={totalLessons}
                    totalDuration={totalDuration}
                    videoId={videoId}
                    onEnrollClick={handleEnrollClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Sticky Footer */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg p-4 z-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              {isFree ? (
                <span className="text-xl font-bold text-emerald-600">Free</span>
              ) : (
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Rs. {finalPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={handleEnrollClick}
              size="lg"
              className="bg-[#D63447] hover:bg-[#D63447]/90 text-white flex-1 max-w-[200px]"
            >
              Enroll Now
            </Button>
          </div>
        </div>

        {/* Spacer for mobile sticky footer */}
        <div className="lg:hidden h-20" />
      </main>

      <Footer />
    </div>
  );
}

// Enrollment Card Component
function EnrollmentCard({
  course,
  isFree,
  finalPrice,
  originalPrice,
  hasDiscount,
  totalLessons,
  totalDuration,
  videoId,
  onEnrollClick,
}) {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      {/* Video Preview */}
      {videoId ? (
        <div className="aspect-video bg-gray-900 relative">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            title="Course Preview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : course.image ? (
        <div className="aspect-video bg-gray-900 relative">
          <img
            src={
              course.image.startsWith("http")
                ? course.image
                : `${process.env.NEXT_PUBLIC_API_URL}/${course.image}`
            }
            alt={course.courseTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white/90 p-3 rounded-full">
              <PlayCircle className="h-10 w-10 text-[#003893]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-[#003893] to-[#002266] flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-white/50" />
        </div>
      )}

      <CardContent className="p-6">
        {/* Price */}
        <div className="mb-4">
          {isFree ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-emerald-600">Free</span>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                No Cost
              </Badge>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  Rs. {finalPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <Badge className="bg-[#D63447] text-white">
                    {course.discount}% OFF
                  </Badge>
                )}
              </div>
              {hasDiscount && (
                <span className="text-gray-500 dark:text-gray-400 line-through">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Enroll Button */}
        <Button
          onClick={onEnrollClick}
          className="w-full bg-[#D63447] hover:bg-[#D63447]/90 text-white mb-4"
          size="lg"
        >
          Enroll Now
        </Button>

        {/* Course Includes */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">This course includes:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Video className="h-4 w-4 text-[#003893] dark:text-blue-400" />
              <span>{totalLessons} video lessons</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4 text-[#003893] dark:text-blue-400" />
              <span>{totalDuration} hours of content</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Globe className="h-4 w-4 text-[#003893] dark:text-blue-400" />
              <span>Full lifetime access</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Award className="h-4 w-4 text-[#003893] dark:text-blue-400" />
              <span>Certificate of completion</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Shield className="h-4 w-4 text-[#003893] dark:text-blue-400" />
              <span>Learn at your own pace</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
