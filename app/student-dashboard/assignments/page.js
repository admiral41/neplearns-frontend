'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssignmentDetailsDialog from '@/components/dashboard/AssignmentDetailsDialog';
import { useStudentAssignments } from '@/lib/hooks/useTutoringAssignment';
import { assignmentAPI } from '@/lib/api/assignments';
import AssignmentCard from '@/components/tutoring/assignments/AssignmentCard';
import {
  Loader2,
  FileText,
  ClipboardList,
  CheckCircle,
  Upload,
  Clock,
  Calendar,
  AlertCircle,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Filter,
} from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';

export default function StudentAssignmentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState(null);

  // Fetch tutoring assignments
  const {
    data: tutoringAssignments,
    isLoading: tutoringLoading,
    isError: tutoringError,
  } = useStudentAssignments();

  // Fetch course assignments
  useEffect(() => {
    const fetchCourseAssignments = async () => {
      try {
        setCourseLoading(true);
        const response = await assignmentAPI.getMyAssignments();
        setCourseAssignments(response.data || []);
      } catch (err) {
        console.error('Error fetching course assignments:', err);
        setCourseError(err);
      } finally {
        setCourseLoading(false);
      }
    };
    fetchCourseAssignments();
  }, []);

  const isLoading = tutoringLoading || courseLoading;
  const isError = tutoringError || courseError;

  // Group tutoring assignments by status
  const tutoringGrouped = useMemo(() => {
    if (!tutoringAssignments) return { toDo: [], submitted: [], reviewed: [] };
    return {
      toDo: tutoringAssignments.filter((a) => a.status === 'active'),
      submitted: tutoringAssignments.filter((a) => a.status === 'submitted'),
      reviewed: tutoringAssignments.filter((a) => a.status === 'reviewed'),
    };
  }, [tutoringAssignments]);

  // Group course assignments by status
  const courseGrouped = useMemo(() => {
    if (!courseAssignments) return { pending: [], submitted: [], graded: [] };
    return {
      pending: courseAssignments.filter((a) => !a.isSubmitted),
      submitted: courseAssignments.filter(
        (a) => a.isSubmitted && a.submission?.score === undefined
      ),
      graded: courseAssignments.filter(
        (a) => a.isSubmitted && a.submission?.score !== undefined
      ),
    };
  }, [courseAssignments]);

  // Stats
  const stats = useMemo(() => {
    const tutoringTotal = tutoringAssignments?.length || 0;
    const courseTotal = courseAssignments?.length || 0;
    const pendingCount =
      tutoringGrouped.toDo.length + courseGrouped.pending.length;
    const submittedCount =
      tutoringGrouped.submitted.length + courseGrouped.submitted.length;
    const completedCount =
      tutoringGrouped.reviewed.length + courseGrouped.graded.length;

    return {
      total: tutoringTotal + courseTotal,
      pending: pendingCount,
      submitted: submittedCount,
      completed: completedCount,
    };
  }, [tutoringAssignments, courseAssignments, tutoringGrouped, courseGrouped]);

  const formatDueDate = (date) => {
    try {
      const dueDate = new Date(date);
      if (isPast(dueDate)) {
        return `Overdue by ${formatDistanceToNow(dueDate)}`;
      }
      return format(dueDate, 'MMM d, yyyy');
    } catch {
      return 'No due date';
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.isSubmitted) {
      if (
        assignment.submission?.score !== undefined &&
        assignment.submission?.score !== null
      ) {
        return (
          <Badge className="flex items-center gap-1 text-xs bg-success text-success-foreground hover:bg-success">
            Graded: {assignment.submission.score}/{assignment.maxScore}
          </Badge>
        );
      }
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 text-xs"
        >
          Pending Review
        </Badge>
      );
    }

    if (isPast(new Date(assignment.dueDate)) && !assignment.allowLateSubmission) {
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-1 text-xs"
        >
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

  // Transform course assignment for dialog
  const transformForDialog = (assignment) => ({
    id: assignment._id,
    courseId: assignment.course?.courseSlug || assignment.course?._id,
    courseName: assignment.course?.courseTitle || 'Course',
    week: assignment.week?.weekNumber || 1,
    title: assignment.title,
    description: assignment.contents || assignment.description,
    dueDate: formatDueDate(assignment.dueDate),
    totalMarks: assignment.maxScore,
    submitted: assignment.isSubmitted,
    submittedDate: assignment.submission?.submittedAt
      ? format(new Date(assignment.submission.submittedAt), 'MMM d, yyyy')
      : null,
    feedback:
      assignment.submission?.score !== undefined
        ? {
            reviewed: true,
            marks: assignment.submission.score,
            comment: assignment.submission.feedback || 'No feedback provided',
            reviewedDate: assignment.submission.gradedAt
              ? format(new Date(assignment.submission.gradedAt), 'MMM d, yyyy')
              : null,
          }
        : assignment.isSubmitted
          ? {
              reviewed: false,
              comment: null,
            }
          : null,
  });

  // Course Assignment Card Component
  const CourseAssignmentCard = ({ assignment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {assignment.course?.courseTitle || 'Course'}
              </span>
            </div>
            <h3 className="font-semibold text-base line-clamp-1">
              {assignment.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Week {assignment.week?.weekNumber || 1}
            </p>
          </div>
          {getStatusBadge(assignment)}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span
              className={
                isPast(new Date(assignment.dueDate)) && !assignment.isSubmitted
                  ? 'text-destructive'
                  : ''
              }
            >
              Due: {formatDueDate(assignment.dueDate)}
            </span>
          </div>
          <span>{assignment.maxScore} marks</span>
        </div>

        {assignment.isSubmitted && assignment.submission?.score !== undefined && (
          <div className="mb-3 p-2.5 bg-muted/30 rounded text-sm">
            <p className="flex items-center gap-1 text-muted-foreground mb-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="font-medium">Feedback</span>
            </p>
            <p className="text-foreground line-clamp-2">
              {assignment.submission.feedback || 'No feedback provided'}
            </p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setSelectedAssignment(transformForDialog(assignment))}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Assignments
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your course and tutoring assignments
            </p>
          </div>

          {/* Stats Cards */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-amber-500">
                    {stats.pending}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {stats.submitted}
                  </p>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {stats.completed}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-600">
              Error loading assignments. Please try again later.
            </div>
          ) : stats.total === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No assignments yet</p>
              <p className="text-sm mt-1">
                Assignments from your courses and tutoring sessions will appear
                here.
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="gap-1.5">
                  <Filter className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="courses" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Courses
                  {courseAssignments.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {courseAssignments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tutoring" className="gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  Tutoring
                  {tutoringAssignments?.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tutoringAssignments.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* All Assignments Tab */}
              <TabsContent value="all" className="space-y-8">
                {/* Pending Section */}
                {(tutoringGrouped.toDo.length > 0 ||
                  courseGrouped.pending.length > 0) && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-amber-500" />
                      <h2 className="text-lg font-semibold">
                        To Do (
                        {tutoringGrouped.toDo.length +
                          courseGrouped.pending.length}
                        )
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courseGrouped.pending.map((a) => (
                        <CourseAssignmentCard key={a._id} assignment={a} />
                      ))}
                      {tutoringGrouped.toDo.map((a) => (
                        <AssignmentCard key={a._id} assignment={a} role="student" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Submitted Section */}
                {(tutoringGrouped.submitted.length > 0 ||
                  courseGrouped.submitted.length > 0) && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-500" />
                      <h2 className="text-lg font-semibold">
                        Submitted (
                        {tutoringGrouped.submitted.length +
                          courseGrouped.submitted.length}
                        )
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courseGrouped.submitted.map((a) => (
                        <CourseAssignmentCard key={a._id} assignment={a} />
                      ))}
                      {tutoringGrouped.submitted.map((a) => (
                        <AssignmentCard key={a._id} assignment={a} role="student" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Completed Section */}
                {(tutoringGrouped.reviewed.length > 0 ||
                  courseGrouped.graded.length > 0) && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h2 className="text-lg font-semibold">
                        Completed (
                        {tutoringGrouped.reviewed.length +
                          courseGrouped.graded.length}
                        )
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courseGrouped.graded.map((a) => (
                        <CourseAssignmentCard key={a._id} assignment={a} />
                      ))}
                      {tutoringGrouped.reviewed.map((a) => (
                        <AssignmentCard key={a._id} assignment={a} role="student" />
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              {/* Course Assignments Tab */}
              <TabsContent value="courses" className="space-y-8">
                {courseAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No course assignments yet</p>
                  </div>
                ) : (
                  <>
                    {courseGrouped.pending.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-amber-500" />
                          <h2 className="text-lg font-semibold">
                            Pending ({courseGrouped.pending.length})
                          </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {courseGrouped.pending.map((a) => (
                            <CourseAssignmentCard key={a._id} assignment={a} />
                          ))}
                        </div>
                      </section>
                    )}

                    {courseGrouped.submitted.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-blue-500" />
                          <h2 className="text-lg font-semibold">
                            Submitted ({courseGrouped.submitted.length})
                          </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {courseGrouped.submitted.map((a) => (
                            <CourseAssignmentCard key={a._id} assignment={a} />
                          ))}
                        </div>
                      </section>
                    )}

                    {courseGrouped.graded.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h2 className="text-lg font-semibold">
                            Graded ({courseGrouped.graded.length})
                          </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {courseGrouped.graded.map((a) => (
                            <CourseAssignmentCard key={a._id} assignment={a} />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Tutoring Assignments Tab */}
              <TabsContent value="tutoring" className="space-y-8">
                {!tutoringAssignments || tutoringAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No tutoring assignments yet</p>
                  </div>
                ) : (
                  <>
                    {tutoringGrouped.toDo.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-amber-500" />
                          <h2 className="text-lg font-semibold">
                            To Do ({tutoringGrouped.toDo.length})
                          </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tutoringGrouped.toDo.map((a) => (
                            <AssignmentCard key={a._id} assignment={a} role="student" />
                          ))}
                        </div>
                      </section>
                    )}

                    {tutoringGrouped.submitted.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-blue-500" />
                          <h2 className="text-lg font-semibold">
                            Submitted ({tutoringGrouped.submitted.length})
                          </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tutoringGrouped.submitted.map((a) => (
                            <AssignmentCard key={a._id} assignment={a} role="student" />
                          ))}
                        </div>
                      </section>
                    )}

                    {tutoringGrouped.reviewed.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h2 className="text-lg font-semibold">
                            Reviewed ({tutoringGrouped.reviewed.length})
                          </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tutoringGrouped.reviewed.map((a) => (
                            <AssignmentCard key={a._id} assignment={a} role="student" />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Assignment Details Dialog for Course Assignments */}
      <AssignmentDetailsDialog
        assignment={selectedAssignment}
        open={!!selectedAssignment}
        onOpenChange={(open) => !open && setSelectedAssignment(null)}
        dashboardMode={true}
      />
    </DashboardLayout>
  );
}
