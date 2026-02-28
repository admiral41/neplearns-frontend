"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Loader2,
  Users,
  Clock,
  Video,
  Star,
  TrendingUp,
  Heart,
  SlidersHorizontal,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/lib/api/courses";
import { categoryAPI } from "@/lib/api/category";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [wishlisted, setWishlisted] = useState({});

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await courseAPI.getAllCourses({
        status: "approved",
        published: true,
        limit: 50,
      });
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getActiveCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const searchCourses = async () => {
    if (!searchQuery.trim()) {
      fetchCourses();
      return;
    }

    setIsLoading(true);
    try {
      const response = await courseAPI.search({ q: searchQuery });
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error searching courses:", error);
      toast.error("Failed to search courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchCourses();
    }
  };

  const toggleWishlist = (courseId) => {
    setWishlisted((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
    toast.success(
      wishlisted[courseId] ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  // Filter and sort courses
  const filteredCourses = courses
    .filter((course) => {
      if (categoryFilter !== "all" && course.category?._id !== categoryFilter) {
        return false;
      }
      if (priceFilter === "free" && course.learn_type !== "FREE") {
        return false;
      }
      if (priceFilter === "paid" && course.learn_type === "FREE") {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.totalEnrollments || 0) - (a.totalEnrollments || 0);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "price-low":
          return (a.finalPrice || a.price || 0) - (b.finalPrice || b.price || 0);
        case "price-high":
          return (b.finalPrice || b.price || 0) - (a.finalPrice || a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

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
        stars.push(<Star key={i} className="h-3.5 w-3.5 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#003893] to-[#002266] text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <GraduationCap className="h-8 w-8" />
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  {courses.length}+ Courses
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Explore All Courses
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Choose from our wide range of courses designed for SEE and +2
                students. Learn from expert instructors at your own pace.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search for courses, topics, or instructors..."
                    className="pl-12 h-12 bg-white text-gray-900 border-0 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button
                  onClick={searchCourses}
                  className="h-12 px-8 bg-[#D63447] hover:bg-[#D63447]/90"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="border-b bg-white sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {filteredCourses.length} results
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
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

                {/* Price Filter */}
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try a different search term or adjust your filters"
                    : "Check back later for new courses"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setPriceFilter("all");
                    fetchCourses();
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course, index) => {
                  const isBestseller = (course.totalEnrollments || 0) > 50;
                  const rating = course.rating || 4.5;
                  const reviewCount = course.totalEnrollments || 0;
                  const originalPrice = course.price || 0;
                  const finalPrice =
                    course.finalPrice ??
                    originalPrice -
                      (originalPrice * (course.discount || 0)) / 100;
                  const hasDiscount =
                    course.discount > 0 && course.learn_type === "PAID";
                  const isFree = course.learn_type === "FREE";

                  return (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.03,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{ y: -8 }}
                    >
                      <Card className="overflow-hidden group cursor-pointer h-full flex flex-col bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-xl transition-shadow duration-300">
                        {/* Thumbnail Section */}
                        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#003893]/10 to-[#D63447]/10">
                          {course.image ? (
                            <img
                              src={
                                course.image.startsWith("http")
                                  ? course.image
                                  : `${process.env.NEXT_PUBLIC_API_URL}/${course.image}`
                              }
                              alt={course.courseTitle}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-[#003893]/40" />
                            </div>
                          )}

                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Wishlist button */}
                          <button
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleWishlist(course._id);
                            }}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4 transition-colors",
                                wishlisted[course._id]
                                  ? "fill-[#D63447] text-[#D63447]"
                                  : "text-gray-600 hover:text-[#D63447]"
                              )}
                            />
                          </button>

                          {/* Price/Discount Badge */}
                          {isFree ? (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 shadow-lg">
                                FREE
                              </Badge>
                            </div>
                          ) : (
                            hasDiscount && (
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-[#D63447] hover:bg-[#D63447]/90 text-white font-bold px-3 py-1 shadow-lg">
                                  {course.discount}% OFF
                                </Badge>
                              </div>
                            )
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
                              ? `${course.lecturers[0].user.firstname} ${course.lecturers[0].user.lastname || ""}`
                              : "Expert Instructor"}
                          </p>

                          {/* Rating Row */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-sm font-bold text-amber-600">
                              {rating.toFixed(1)}
                            </span>
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
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {course.category?.categoryName || "General"}
                            </Badge>
                          </div>

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Pricing Section */}
                          <div className="flex items-center justify-between mb-3">
                            {isFree ? (
                              <span className="text-lg font-bold text-emerald-600">
                                Free
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  Rs. {finalPrice.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    Rs. {originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>

                        {/* Action Button */}
                        <div className="px-4 pb-4">
                          <Link href={`/courses/${course.courseSlug || course._id}`}>
                            <Button className="w-full bg-[#D63447] hover:bg-[#D63447]/90 text-white">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full bg-white dark:bg-gray-800 border-0 shadow-sm">
      <Skeleton className="h-44 w-full" />
      <CardContent className="p-4 flex-1 flex flex-col">
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <div className="flex items-center gap-1.5 mb-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-20 mb-3" />
        <div className="flex-1" />
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
