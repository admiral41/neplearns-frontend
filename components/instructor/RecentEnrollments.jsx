"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRecentEnrollments } from "@/lib/hooks/useInstructor";

// API base URL for images
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

export default function RecentEnrollments() {
  const { data: response, isLoading, error } = useRecentEnrollments({ limit: 5 });

  const enrollments = response?.data || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load recent enrollments</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Enrollments</CardTitle>
        <Link href="/instructor-dashboard/students">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {enrollments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No enrollments yet</p>
            <p className="text-xs mt-1">Students will appear here when they enroll</p>
          </div>
        ) : (
          enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={getImageUrl(enrollment.studentAvatar)} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {enrollment.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {enrollment.studentName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {enrollment.courseName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-primary">
                  {enrollment.amount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
