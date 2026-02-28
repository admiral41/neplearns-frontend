"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PlayCircle, Loader2, BookX } from "lucide-react";
import { getProgressColor } from "@/lib/utils/progress";
import { courseAPI } from "@/lib/api/courses";

export default function EnrolledModules() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      const response = await courseAPI.getMyCourses('enrolled');
      setCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Enrolled Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Enrolled Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">Failed to load courses</p>
          <Button variant="outline" size="sm" onClick={fetchEnrolledCourses} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Enrolled Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <BookX className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">You haven't enrolled in any courses yet</p>
          <Link href="/student-dashboard/courses">
            <Button size="sm" variant="outline">
              Browse Courses
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Enrolled Modules
          <Badge variant="secondary" className="ml-auto text-xs">
            {courses.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.slice(0, 5).map((course) => (
          <div
            key={course._id}
            className="p-3 sm:p-4 border rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base line-clamp-1">
                  {course.courseTitle}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {course.completedLessons || 0} of {course.totalLessons || 0} lessons
                </p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {course.category?.categoryName || 'Course'}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-semibold">{course.progress || 0}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(course.progress || 0)} transition-all duration-300`}
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>
            </div>

            <Link href={`/student-dashboard/courses/${course.courseSlug}`}>
              <Button size="sm" className="w-full sm:w-auto" variant="outline">
                <PlayCircle className="h-4 w-4 mr-2" />
                {course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </Button>
            </Link>
          </div>
        ))}

        {courses.length > 5 && (
          <Link href="/student-dashboard/courses" className="block">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              View all {courses.length} courses
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
