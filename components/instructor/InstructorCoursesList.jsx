"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Star, MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// Status badge mapping
const getStatusBadge = (status) => {
  const statusMap = {
    published: { label: "Published", variant: "default" },
    approved: { label: "Approved", variant: "default" },
    pending_approval: { label: "Pending", variant: "secondary" },
    draft: { label: "Draft", variant: "outline" },
    rejected: { label: "Rejected", variant: "destructive" },
  };
  return statusMap[status] || { label: status, variant: "secondary" };
};

export default function InstructorCoursesList({ courses = [], isLoading = false }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">My Courses</CardTitle>
        <Link href="/instructor-dashboard/courses">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-lg border">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))
        ) : courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No courses yet</p>
            <Link href="/instructor-dashboard/courses/new">
              <Button size="sm" className="mt-3">
                Create Your First Course
              </Button>
            </Link>
          </div>
        ) : (
          courses.slice(0, 5).map((course) => {
            const statusBadge = getStatusBadge(course.status);
            const courseSlug = course.slug || course._id;

            return (
              <Link
                key={course._id || course.id}
                href={`/instructor-dashboard/edit-all-course/${courseSlug}`}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-sm truncate">
                        {course.courseTitle || course.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.enrolledCount || course.students || 0} students
                        </span>
                        {(course.averageRating || course.rating) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {course.averageRating || course.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusBadge.variant} className="shrink-0">
                      {statusBadge.label}
                    </Badge>
                  </div>
                  {(course.status === "draft" || course.status === "pending_approval") && course.progress && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1.5" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-primary">
                      {course.learn_type === "FREE" ? "Free" : `Rs. ${course.price || 0}`}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/instructor-dashboard/courses/${courseSlug}/students`}>
                            <Users className="h-4 w-4 mr-2" />
                            View Students
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/courses/${courseSlug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
