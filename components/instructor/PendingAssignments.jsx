"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Clock, FileText, AlertCircle, GraduationCap, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePendingSubmissions } from "@/lib/hooks/useInstructor";
import { useInstructorAssignments } from "@/lib/hooks/useTutoringAssignment";

export default function PendingAssignments() {
  const { data: response, isLoading, error } = usePendingSubmissions({ limit: 5 });
  const { data: tutoringAssignments, isLoading: tutoringLoading } = useInstructorAssignments({ status: 'submitted' });

  const pendingSubmissions = response?.data || [];
  const pendingTutoring = tutoringAssignments || [];
  const totalPending = (response?.totalPending || 0) + pendingTutoring.length;

  if (isLoading && tutoringLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Pending Grading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
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
          <CardTitle className="text-lg font-semibold">Pending Grading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load pending submissions</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasPending = pendingSubmissions.length > 0 || pendingTutoring.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Pending Grading</CardTitle>
          {totalPending > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {totalPending}
            </Badge>
          )}
        </div>
        <Link href="/instructor-dashboard/assignments">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasPending ? (
          <div className="text-center py-6 text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending submissions to grade</p>
            <p className="text-xs mt-1">All caught up!</p>
          </div>
        ) : (
          <>
            {/* Tutoring Assignments */}
            {pendingTutoring.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Tutoring
                  </p>
                  <Link
                    href="/instructor-dashboard/tutoring/assignments"
                    className="text-xs text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {pendingTutoring.slice(0, 3).map((assignment) => (
                    <Link
                      key={assignment._id}
                      href="/instructor-dashboard/tutoring/assignments"
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <GraduationCap className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {assignment.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {assignment.subject?.name || "Tutoring"}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {assignment.student?.firstname} {assignment.student?.lastname}
                          </span>
                          {assignment.submission?.submittedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(assignment.submission.submittedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        Review
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Course Assignments */}
            {pendingSubmissions.length > 0 && (
              <div className="space-y-2">
                {pendingTutoring.length > 0 && (
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Courses
                  </p>
                )}
                <div className="space-y-2">
                  {pendingSubmissions.map((assignment) => (
                    <div
                      key={assignment.assignmentId}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {assignment.assignmentTitle}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {assignment.courseName}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {assignment.submissionsCount} submissions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {assignment.dueDate && new Date(assignment.dueDate) > new Date()
                              ? `Due ${formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}`
                              : assignment.dueDate
                              ? `Overdue ${formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: false })}`
                              : "No due date"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="secondary" className="mb-1">
                          {assignment.pendingGrading} to grade
                        </Badge>
                        <Link href={assignment.submissions?.[0]?._id
                          ? `/instructor-dashboard/assignments/${assignment.submissions[0]._id}`
                          : '/instructor-dashboard/assignments'}>
                          <Button size="sm" variant="outline" className="w-full">
                            Grade
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
