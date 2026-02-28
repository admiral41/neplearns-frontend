"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AssignmentDetailsDialog from "./AssignmentDetailsDialog";
import { FileText, Calendar, AlertCircle, Clock, MessageSquare, Loader2, FileX, GraduationCap } from "lucide-react";
import { assignmentAPI } from "@/lib/api/assignments";
import { tutoringAssignmentAPI } from "@/lib/api/tutoringAssignment";
import { format, isPast, formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function Assignments() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [tutoringAssignments, setTutoringAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both course and tutoring assignments in parallel
      const [courseRes, tutoringRes] = await Promise.all([
        assignmentAPI.getMyAssignments({ limit: 6 }),
        tutoringAssignmentAPI.getStudentAssignments({ status: 'active' })
      ]);

      setAssignments(courseRes.data || []);
      setTutoringAssignments(tutoringRes.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDueDate = (date) => {
    try {
      const dueDate = new Date(date);
      if (isPast(dueDate)) {
        return `Overdue by ${formatDistanceToNow(dueDate)}`;
      }
      return format(dueDate, "MMM d, yyyy");
    } catch {
      return "No due date";
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.isSubmitted) {
      if (assignment.submission?.score !== undefined && assignment.submission?.score !== null) {
        return (
          <Badge className="flex items-center gap-1 text-xs bg-success text-success-foreground hover:bg-success">
            Graded: {assignment.submission.score}/{assignment.maxScore}
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          Pending Review
        </Badge>
      );
    }

    // Check if overdue
    if (isPast(new Date(assignment.dueDate)) && !assignment.allowLateSubmission) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3" />
        Not Submitted
      </Badge>
    );
  };

  // Transform assignment data for the dialog
  const transformForDialog = (assignment) => ({
    id: assignment._id,
    courseId: assignment.course?.courseSlug || assignment.course?._id,
    courseName: assignment.course?.courseTitle || "Course",
    week: assignment.week?.weekNumber || 1,
    title: assignment.title,
    description: assignment.contents || assignment.description,
    dueDate: formatDueDate(assignment.dueDate),
    totalMarks: assignment.maxScore,
    submitted: assignment.isSubmitted,
    submittedDate: assignment.submission?.submittedAt
      ? format(new Date(assignment.submission.submittedAt), "MMM d, yyyy")
      : null,
    feedback: assignment.submission?.score !== undefined ? {
      reviewed: true,
      marks: assignment.submission.score,
      comment: assignment.submission.feedback || "No feedback provided",
      reviewedDate: assignment.submission.gradedAt
        ? format(new Date(assignment.submission.gradedAt), "MMM d, yyyy")
        : null
    } : assignment.isSubmitted ? {
      reviewed: false,
      comment: null
    } : null
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Upcoming Assignments
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
            <FileText className="h-5 w-5 text-primary" />
            Upcoming Assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">Failed to load assignments</p>
          <Button variant="outline" size="sm" onClick={fetchAssignments} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalCount = assignments.length + tutoringAssignments.length;

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Upcoming Assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileX className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No assignments yet</p>
        </CardContent>
      </Card>
    );
  }

  const getTutoringStatusBadge = (assignment) => {
    if (assignment.status === 'reviewed') {
      return (
        <Badge className="flex items-center gap-1 text-xs bg-success text-success-foreground hover:bg-success">
          Reviewed
        </Badge>
      );
    }
    if (assignment.status === 'submitted') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          Submitted
        </Badge>
      );
    }
    // active status
    if (assignment.dueDate && isPast(new Date(assignment.dueDate))) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3" />
        To Do
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Upcoming Assignments
          <Badge variant="secondary" className="ml-auto text-xs">
            {totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tutoring Assignments */}
        {tutoringAssignments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Tutoring
              </p>
              <Link
                href="/student-dashboard/tutoring/assignments"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {tutoringAssignments.slice(0, 4).map((assignment) => (
                <Link
                  key={assignment._id}
                  href="/student-dashboard/tutoring/assignments"
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow block"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base line-clamp-1">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {assignment.subject?.name || "Tutoring"} • {assignment.instructor?.firstname || "Instructor"}
                      </p>
                    </div>
                    {getTutoringStatusBadge(assignment)}
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span className={assignment.dueDate && isPast(new Date(assignment.dueDate)) ? "text-destructive" : ""}>
                      {assignment.dueDate ? `Due: ${formatDueDate(assignment.dueDate)}` : "No due date"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Course Assignments */}
        {assignments.length > 0 && (
          <div className="space-y-2">
            {tutoringAssignments.length > 0 && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Courses
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base line-clamp-1">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {assignment.course?.courseTitle || "Course"} • Week {assignment.week?.weekNumber || 1}
                      </p>
                    </div>
                    {getStatusBadge(assignment)}
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className={isPast(new Date(assignment.dueDate)) && !assignment.isSubmitted ? "text-destructive" : ""}>
                        Due: {formatDueDate(assignment.dueDate)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{assignment.maxScore} marks</span>
                  </div>

                  {assignment.isSubmitted && assignment.submission?.score !== undefined && (
                    <div className="mb-2.5 p-2 bg-muted/30 rounded text-xs">
                      <p className="flex items-center gap-1 text-muted-foreground mb-1">
                        <MessageSquare className="h-3 w-3" />
                        <span className="font-medium">Teacher Feedback</span>
                      </p>
                      <p className="text-foreground line-clamp-2">
                        {assignment.submission.feedback || "No feedback provided"}
                      </p>
                    </div>
                  )}

                  {assignment.isSubmitted && assignment.submission?.score === undefined && (
                    <div className="mb-2.5 p-2 bg-info/10 rounded text-xs flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-info shrink-0" />
                      <span className="text-foreground">Awaiting teacher review</span>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-8"
                    onClick={() => setSelectedAssignment(transformForDialog(assignment))}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Assignment Details Dialog */}
      <AssignmentDetailsDialog
        assignment={selectedAssignment}
        open={!!selectedAssignment}
        onOpenChange={(open) => !open && setSelectedAssignment(null)}
        dashboardMode={true}
      />
    </Card>
  );
}
