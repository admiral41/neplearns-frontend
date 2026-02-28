"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Search,
  Loader2,
  PlusCircle,
  Users,
  Clock,
  Video,
  Filter,
  Star,
  TrendingUp,
  ArrowRight,
  BookMarked,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/lib/api/courses";
import { categoryAPI } from "@/lib/api/category";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState("my-courses");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAvailableCourses();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "browse" && searchQuery) {
      searchCourses();
    }
  }, [searchQuery, activeTab]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await courseAPI.getMyCourses({ type: 'enrolled' });
      setEnrolledCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      toast.error('Failed to load enrolled courses');
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses({
        status: 'approved',
        published: true,
        limit: 20
      });
      setAvailableCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getActiveCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchCourses = async () => {
    if (!searchQuery.trim()) {
      fetchAvailableCourses();
      return;
    }

    setIsLoading(true);
    try {
      const response = await courseAPI.search({ q: searchQuery });
      setAvailableCourses(response.data || []);
    } catch (error) {
      console.error('Error searching courses:', error);
      toast.error('Failed to search courses');
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      // First get course slug
      const course = availableCourses.find(c => c._id === courseId);
      if (!course) return;

      await courseAPI.enrollInCourse(course.courseSlug);
      toast.success('Successfully enrolled in the course!');
      
      // Refresh both lists
      fetchEnrolledCourses();
      fetchAvailableCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error.message || 'Failed to enroll in course');
    }
  };

  const calculateProgress = (course) => {
    // Use real progress from backend API
    return course.progress || 0;
  };

  const getCourseStats = () => {
    const inProgress = enrolledCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
    const completed = enrolledCourses.filter(c => (c.progress || 0) === 100);
    const notStarted = enrolledCourses.filter(c => (c.progress || 0) === 0);

    return {
      total: enrolledCourses.length,
      inProgress: inProgress.length,
      completed: completed.length,
      notStarted: notStarted.length,
      totalLessons: enrolledCourses.reduce((sum, c) => sum + (c.totalLessons || 0), 0),
      completedLessons: enrolledCourses.reduce((sum, c) => sum + (c.completedLessons || 0), 0),
      totalEnrollments: availableCourses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)
    };
  };

  const stats = getCourseStats();
  const filteredCourses = availableCourses.filter(course => {
    if (categoryFilter === 'all') return true;
    return course.category?._id === categoryFilter;
  });

  const inProgressCourses = enrolledCourses.filter(course => (course.progress || 0) < 100);
  const completedCourses = enrolledCourses.filter(course => (course.progress || 0) === 100);

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-2">My Learning</h1>
            <p className="text-muted-foreground">
              Track your progress and discover new courses
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/student-dashboard/live-classes">
              <Button variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Live Classes
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Enrolled</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.completedLessons}/{stats.totalLessons} lessons done
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <PlayCircle className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">In Progress</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.inProgress}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Active learning
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Great work!
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Community</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalEnrollments}+</div>
              <div className="text-xs text-muted-foreground mt-1">
                Students learning
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="my-courses" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              My Courses
              <Badge variant="secondary" className="ml-2">
                {enrolledCourses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Browse Courses
              <Badge variant="secondary" className="ml-2">
                {availableCourses.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="my-courses" className="space-y-8">
            {/* In Progress Courses */}
            {inProgressCourses.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Continue Learning</h2>
                  <Badge variant="outline">
                    {inProgressCourses.length} active
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((course) => {
                    const progress = calculateProgress(course);
                    return (
                      <Card key={course._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1 line-clamp-2">
                                  {course.courseTitle}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {course.lecturers?.[0]?.user?.firstname || 'Instructor'}
                                </p>
                              </div>
                              <Badge variant="secondary" className="shrink-0">
                                {course.category?.categoryName}
                              </Badge>
                            </div>

                            {/* Progress */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Progress
                                </span>
                                <span className="font-medium">
                                  {progress}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            {/* Course Info */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {course.completedLessons || 0}/{course.totalLessons || 0} lessons
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.duration || 0}h
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {course.rating?.toFixed(1) || '0.0'}
                              </div>
                            </div>

                            {/* Action */}
                            <div className="pt-2">
                              <Link href={`/student-dashboard/courses/${course.courseSlug}`}>
                                <Button size="sm" className="w-full">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Continue Learning
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses enrolled yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Browse courses and start your learning journey
                  </p>
                  <Button onClick={() => setActiveTab("browse")}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Completed Courses</h2>
                  <Badge variant="outline">
                    {completedCourses.length} completed
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((course) => (
                    <Card key={course._id}>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-base">
                                  {course.courseTitle}
                                </h3>
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {course.lecturers?.[0]?.user?.firstname || 'Instructor'}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {course.category?.categoryName}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                              {course.totalLessons || 0} lessons
                            </div>
                            <div className="text-green-600 font-medium">
                              100% Complete
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/student-dashboard/courses/${course.courseSlug}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full">
                                Review Course
                              </Button>
                            </Link>
                            <Button size="sm" variant="ghost">
                              <Star className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Browse Courses Tab */}
          <TabsContent value="browse">
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search courses, topics, or instructors..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="w-full md:w-48">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={searchCourses} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Courses Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredCourses.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'Check back later for new courses'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {searchQuery ? 'Search Results' : 'Popular Courses'}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {filteredCourses.length} courses found
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCourses.map((course, index) => {
                      const isEnrolled = enrolledCourses.some(
                        ec => ec._id === course._id
                      );
                      const isBestseller = (course.totalEnrollments || 0) > 50;
                      const rating = course.rating || 4.5;
                      const reviewCount = course.totalEnrollments || 0;

                      // Star rating renderer
                      const renderStars = (rating) => {
                        const stars = [];
                        const fullStars = Math.floor(rating);
                        const hasHalfStar = rating % 1 >= 0.5;

                        for (let i = 0; i < 5; i++) {
                          if (i < fullStars) {
                            stars.push(
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            );
                          } else if (i === fullStars && hasHalfStar) {
                            stars.push(
                              <div key={i} className="relative">
                                <Star className="h-3.5 w-3.5 text-gray-300" />
                                <div className="absolute inset-0 overflow-hidden w-1/2">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                </div>
                              </div>
                            );
                          } else {
                            stars.push(
                              <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
                            );
                          }
                        }
                        return stars;
                      };

                      return (
                        <motion.div
                          key={course._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{ y: -8 }}
                        >
                          <Card className="overflow-hidden group cursor-pointer h-full flex flex-col bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-xl transition-shadow duration-300">
                            {/* Thumbnail Section */}
                            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                              {course.image ? (
                                <img
                                  src={course.image.startsWith("http") ? course.image : `${process.env.NEXT_PUBLIC_API_URL}/${course.image}`}
                                  alt={course.courseTitle}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#003893]/10 to-[#D63447]/10">
                                  <BookOpen className="h-16 w-16 text-[#003893]/40" />
                                </div>
                              )}

                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* Wishlist button */}
                              <button
                                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success('Added to wishlist');
                                }}
                              >
                                <Heart className="h-4 w-4 text-gray-600 dark:text-gray-300 hover:text-[#D63447] hover:fill-[#D63447] transition-colors" />
                              </button>

                              {/* Price/Discount Badge - Top Left */}
                              {course.learn_type === 'FREE' ? (
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 shadow-lg">
                                    FREE
                                  </Badge>
                                </div>
                              ) : course.discount > 0 && (
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-[#D63447] hover:bg-[#D63447]/90 text-white font-bold px-3 py-1 shadow-lg">
                                    {course.discount}% OFF
                                  </Badge>
                                </div>
                              )}

                              {/* Bestseller Badge */}
                              {isBestseller && (
                                <div className="absolute bottom-3 left-3">
                                  <Badge className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold text-xs px-2.5 py-1 shadow-md">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Bestseller
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Content Section */}
                            <CardContent className="p-4 flex-1 flex flex-col">
                              {/* Title */}
                              <h3 className="font-bold text-base mb-1 line-clamp-2 text-gray-900 dark:text-white group-hover:text-[#003893] dark:group-hover:text-blue-400 transition-colors">
                                {course.courseTitle}
                              </h3>

                              {/* Instructor */}
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                {course.lecturers?.[0]?.user?.firstname
                                  ? `${course.lecturers[0].user.firstname} ${course.lecturers[0].user.lastname || ''}`
                                  : 'Expert Instructor'}
                              </p>

                              {/* Rating Row */}
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-sm font-bold text-amber-600">{rating.toFixed(1)}</span>
                                <div className="flex items-center gap-0.5">
                                  {renderStars(rating)}
                                </div>
                              </div>

                              {/* Metadata Row */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{course.duration || 0}h total</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Video className="h-3.5 w-3.5" />
                                  <span>{course.totalLessons || 0} lessons</span>
                                </div>
                              </div>

                              {/* Category */}
                              <div className="mb-3">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {course.category?.categoryName || 'General'}
                                </Badge>
                              </div>

                              {/* Spacer */}
                              <div className="flex-1" />

                              {/* Pricing Section */}
                              <div className="flex items-center justify-between mb-3">
                                {course.learn_type === 'FREE' ? (
                                  <span className="text-lg font-bold text-emerald-600">Free</span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                      Rs. {course.finalPrice || course.price}
                                    </span>
                                    {course.discount > 0 && (
                                      <span className="text-sm text-muted-foreground line-through">
                                        Rs. {course.price}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>

                            {/* Action Button */}
                            <div className="px-4 pb-4">
                              {isEnrolled ? (
                                <Link href={`/student-dashboard/courses/${course.courseSlug}`} className="block">
                                  <Button className="w-full bg-[#003893] hover:bg-[#003893]/90 text-white">
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Continue Learning
                                  </Button>
                                </Link>
                              ) : (
                                <Button
                                  className="w-full bg-[#D63447] hover:bg-[#D63447]/90 text-white"
                                  onClick={() => enrollInCourse(course._id)}
                                >
                                  <PlusCircle className="h-4 w-4 mr-2" />
                                  {course.learn_type === 'FREE' ? 'Enroll Now - Free' : `Enroll Now`}
                                </Button>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* View More */}
                  {filteredCourses.length > 0 && !searchQuery && (
                    <div className="text-center pt-4">
                      <Link href="/courses">
                        <Button variant="outline">
                          View All Courses
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}