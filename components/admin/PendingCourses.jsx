"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Check, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { usePendingCourses, useApproveCourse, useRejectCourse } from "@/lib/hooks/useAdmin";
import { formatDistanceToNow } from "date-fns";

export default function PendingCourses() {
  const { data: pendingData, isLoading, error } = usePendingCourses({ limit: 5 });
  const { mutate: approveCourse, isPending: isApproving } = useApproveCourse();
  const { mutate: rejectCourse, isPending: isRejecting } = useRejectCourse();

  const pendingCourses = pendingData?.courses || [];
  const totalPending = pendingData?.total || pendingCourses.length;

  const handleApprove = (courseId) => {
    approveCourse(courseId);
  };

  const handleReject = (courseId) => {
    rejectCourse({ courseId, reason: "Course does not meet quality standards" });
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return "Recently";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  // Get instructor name
  const getInstructorName = (course) => {
    if (course.createdBy?.firstname && course.createdBy?.lastname) {
      return `${course.createdBy.firstname} ${course.createdBy.lastname}`;
    }
    if (course.lecturers?.[0]?.firstname) {
      return `${course.lecturers[0].firstname} ${course.lecturers[0].lastname || ''}`;
    }
    return "Unknown Instructor";
  };

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Pending Course Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load pending courses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Pending Course Approvals
        </CardTitle>
        <Badge variant="secondary">
          {isLoading ? "..." : `${totalPending} pending`}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-10" />
                  <Skeleton className="h-8 w-10" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No courses pending approval
          </p>
        ) : (
          <>
            {pendingCourses.map((course) => (
              <div
                key={course._id}
                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-medium text-sm line-clamp-1">
                      {course.courseTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      by {getInstructorName(course)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {course.category?.categoryName || "Uncategorized"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>
                    {course.learn_type === "FREE"
                      ? "Free"
                      : `Rs. ${(course.price || 0).toLocaleString()}`}
                  </span>
                  <span>Submitted {formatTimeAgo(course.createdAt)}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin-dashboard/courses/${course._id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleApprove(course._id)}
                    disabled={isApproving || isRejecting}
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleReject(course._id)}
                    disabled={isApproving || isRejecting}
                  >
                    {isRejecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            <Link href="/admin-dashboard/courses?status=pending">
              <Button variant="outline" className="w-full" size="sm">
                View All Pending Courses
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
