"use client";

import React, { useState, useEffect } from "react";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  Users,
  Eye,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Lock,
  Check,
  X,
  Clock,
  ClipboardList,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import {
  useCourseWeeks,
  useWeekLessons,
  useLessonAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useAssignmentSubmissions,
  useGradeSubmission,
  usePendingSubmissions,
  useAllSubmissions,
} from "@/lib/hooks/useInstructor";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { courseAPI } from "@/lib/api/courses";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState("by-lesson");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [allSearchQuery, setAllSearchQuery] = useState("");
  const [allStatusFilter, setAllStatusFilter] = useState("all");
  const [expandedAssignment, setExpandedAssignment] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contents: "",
    dueDate: "",
    maxScore: 100,
    passingScore: 50,
    allowLateSubmission: false,
    lateSubmissionPenalty: 0,
    isActive: true,
  });

  const [gradeData, setGradeData] = useState({
    score: "",
    feedback: "",
  });

  // Fetch instructor's courses
  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await courseAPI.getMyCourses('created');
        setCourses(response.data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchInstructorCourses();
  }, []);

  // Fetch weeks when course is selected
  const { data: weeksData, isLoading: weeksLoading } = useCourseWeeks(selectedCourse);
  const weeks = weeksData?.data || [];

  // Fetch lessons when week is selected
  const { data: lessonsData, isLoading: lessonsLoading } = useWeekLessons(selectedWeek);
  const lessons = lessonsData?.data || [];

  // Fetch assignments when lesson is selected
  const { data: assignmentsData, isLoading: assignmentsLoading } = useLessonAssignments(selectedLesson);
  const assignments = assignmentsData?.data || assignmentsData || [];

  const { data: submissionsData } = useAssignmentSubmissions(expandedAssignment);
  const submissions = submissionsData?.data || [];

  // Fetch all pending submissions for grading
  const { data: pendingResponse, isLoading: pendingLoading } = usePendingSubmissions({ limit: 100 });
  const pendingSubmissions = pendingResponse?.data || [];
  const totalPending = pendingResponse?.totalPending || 0;

  // Fetch all submissions
  const { data: allResponse, isLoading: allLoading } = useAllSubmissions({ limit: 200 });
  const allSubmissions = allResponse?.data || [];
  const totalSubmissions = allResponse?.total || 0;

  // Mutations
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const gradeSubmission = useGradeSubmission();

  // Reset dependent selections when parent changes
  useEffect(() => {
    if (selectedCourse) {
      setSelectedWeek("");
      setSelectedLesson("");
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedWeek) {
      setSelectedLesson("");
    }
  }, [selectedWeek]);

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);
  const selectedLessonData = lessons.find((l) => l._id === selectedLesson);
  const isCourseApproved = selectedCourseData ? 
    (selectedCourseData.status === 'approved' || selectedCourseData.status === 'published') : false;
  const isCoursePublished = selectedCourseData ? selectedCourseData.published : false;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      contents: "",
      dueDate: "",
      maxScore: 100,
      passingScore: 50,
      allowLateSubmission: false,
      lateSubmissionPenalty: 0,
      isActive: true,
    });
    setIsEditing(false);
    setEditingAssignment(null);
  };

  const openCreateDialog = () => {
    if (!selectedLesson) {
      toast.error("Please select a lesson first");
      return;
    }

    if (!isCourseApproved) {
      toast.error("You can only create assignments for approved courses");
      return;
    }

    resetForm();

    // Set default due date to 7 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    setFormData((prev) => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split("T")[0],
    }));

    setIsDialogOpen(true);
  };

  const openEditDialog = (assignment) => {
    if (!isCourseApproved) {
      toast.error("You can only edit assignments for approved courses");
      return;
    }

    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      contents: assignment.contents || "",
      dueDate: dueDate ? dueDate.toISOString().split("T")[0] : "",
      maxScore: assignment.maxScore || 100,
      passingScore: assignment.passingScore || 50,
      allowLateSubmission: assignment.allowLateSubmission || false,
      lateSubmissionPenalty: assignment.lateSubmissionPenalty || 0,
      isActive: assignment.isActive !== false,
    });
    setEditingAssignment(assignment);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openGradeDialog = (submission) => {
    if (!isCourseApproved) {
      toast.error("You can only grade submissions for approved courses");
      return;
    }

    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || "",
      feedback: submission.feedback || "",
    });
    setIsGradingDialogOpen(true);
  };

  const getCourseStatusBadge = (course) => {
    if (course.status === 'approved' || course.status === 'published') {
      return (
        <Badge className="bg-green-500">
          <Check className="h-3 w-3 mr-1" />
          {course.published ? 'Published' : 'Approved'}
        </Badge>
      );
    } else if (course.status === 'pending_approval') {
      return (
        <Badge variant="secondary">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Pending
        </Badge>
      );
    } else if (course.status === 'rejected') {
      return (
        <Badge variant="destructive">
          <X className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    } else if (course.status === 'draft') {
      return (
        <Badge variant="outline">
          <FileText className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Assignment title is required");
      return;
    }
    if (!formData.contents.trim()) {
      toast.error("Assignment contents/instructions are required");
      return;
    }
    if (!formData.dueDate) {
      toast.error("Due date is required");
      return;
    }
    if (parseInt(formData.passingScore) > parseInt(formData.maxScore)) {
      toast.error("Passing score cannot exceed maximum score");
      return;
    }
    if (!isCourseApproved) {
      toast.error("You can only create assignments for approved courses");
      return;
    }

    try {
      const assignmentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        contents: formData.contents.trim(),
        dueDate: formData.dueDate,
        maxScore: parseInt(formData.maxScore),
        passingScore: parseInt(formData.passingScore),
        lesson: selectedLesson,
        allowLateSubmission: formData.allowLateSubmission,
        lateSubmissionPenalty: parseInt(formData.lateSubmissionPenalty) || 0,
        isActive: formData.isActive,
      };

      if (isEditing && editingAssignment) {
        await updateAssignment.mutateAsync({
          assignmentId: editingAssignment._id,
          assignmentData,
        });
        toast.success("Assignment updated successfully!");
      } else {
        await createAssignment.mutateAsync(assignmentData);
        toast.success("Assignment created successfully!");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error(error.message || "Failed to save assignment");
    }
  };

  const handleGradeSubmit = async () => {
    if (!gradeData.score || isNaN(gradeData.score) || parseFloat(gradeData.score) < 0) {
      toast.error("Please enter a valid score");
      return;
    }

    if (!selectedSubmission) return;

    if (!isCourseApproved) {
      toast.error("You can only grade submissions for approved courses");
      return;
    }

    try {
      await gradeSubmission.mutateAsync({
        submissionId: selectedSubmission._id,
        gradeData: {
          score: parseFloat(gradeData.score),
          feedback: gradeData.feedback.trim(),
        },
      });

      toast.success("Submission graded successfully!");
      setIsGradingDialogOpen(false);
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error(error.message || "Failed to grade submission");
    }
  };

  const handleDeleteClick = (assignment) => {
    if (!isCourseApproved) {
      toast.error("You can only delete assignments for approved courses");
      return;
    }

    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assignmentToDelete) {
      if (!isCourseApproved) {
        toast.error("You can only delete assignments for approved courses");
        return;
      }

      try {
        await deleteAssignment.mutateAsync(assignmentToDelete._id);
        toast.success("Assignment deleted successfully!");
        setDeleteDialogOpen(false);
        setAssignmentToDelete(null);
      } catch (error) {
        console.error("Error deleting assignment:", error);
        toast.error(error.message || "Failed to delete assignment");
      }
    }
  };

  const toggleAssignmentExpansion = (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(assignmentId);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid Date";
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM d, h:mm a") : "Invalid Date";
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (assignment) => {
    if (!assignment.isActive) {
      return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (now > dueDate) {
      return <Badge variant="destructive" className="text-xs">Closed</Badge>;
    }

    return <Badge className="bg-green-500 text-xs">Active</Badge>;
  };

  const getSubmissionStatusBadge = (submission) => {
    if (submission.score !== undefined && submission.score !== null) {
      return <Badge className="bg-green-500 text-xs">Graded</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Pending</Badge>;
  };

  const filteredAssignments = Array.isArray(assignments)
    ? assignments.filter(
        (assignment) =>
          assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (assignment.description && assignment.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const isSaving = createAssignment.isPending || updateAssignment.isPending;

  return (
    <InstructorDashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Assignments</h1>
            <p className="text-muted-foreground mt-1">Manage assignments and grade submissions for approved courses</p>
          </div>

          <div className="flex gap-2">
            {activeTab === "by-lesson" && selectedLesson && (
              <Button
                onClick={openCreateDialog}
                disabled={!isCourseApproved}
                className={!isCourseApproved ? "cursor-not-allowed opacity-60" : ""}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
                {!isCourseApproved && (
                  <Lock className="h-3 w-3 ml-2" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="by-lesson" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              By Lesson
            </TabsTrigger>
            <TabsTrigger value="pending-grading" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Pending
              {totalPending > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {totalPending > 99 ? "99+" : totalPending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all-submissions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Submissions
            </TabsTrigger>
          </TabsList>

          {/* By Lesson Tab */}
          <TabsContent value="by-lesson" className="space-y-6">
            {/* Course/Week/Lesson Selection */}
            <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                {isLoadingCourses ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Only show approved courses first */}
                      {courses
                        .filter(course => course.status === 'approved' || course.status === 'published')
                        .map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{course.courseTitle}</span>
                              <Badge className="ml-2">
                                {course.learn_type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      
                      {/* Separator for non-approved courses */}
                      {courses.some(c => c.status !== 'approved' && c.status !== 'published') && (
                        <>
                          <div className="h-px bg-border my-1" />
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Courses awaiting approval
                          </div>
                        </>
                      )}
                      
                      {/* Non-approved courses (disabled) */}
                      {courses
                        .filter(course => course.status !== 'approved' && course.status !== 'published')
                        .map((course) => (
                          <SelectItem 
                            key={course._id} 
                            value={course._id}
                            disabled={true}
                            className="opacity-60 cursor-not-allowed"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{course.courseTitle}</span>
                              {getCourseStatusBadge(course)}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Week</Label>
                <Select
                  value={selectedWeek}
                  onValueChange={setSelectedWeek}
                  disabled={!selectedCourse || weeksLoading || !isCourseApproved}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={weeksLoading ? "Loading..." : "Select week"} />
                  </SelectTrigger>
                  <SelectContent>
                    {weeks.map((week) => (
                      <SelectItem key={week._id} value={week._id}>
                        Week {week.weekNumber}: {week.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lesson</Label>
                <Select
                  value={selectedLesson}
                  onValueChange={setSelectedLesson}
                  disabled={!selectedWeek || lessonsLoading || !isCourseApproved}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={lessonsLoading ? "Loading..." : "Select lesson"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson._id} value={lesson._id}>
                        {lesson.lessonTitle || lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedCourseData && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-lg">{selectedCourseData.courseTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getCourseStatusBadge(selectedCourseData)}
                          <Badge variant="outline">
                            {selectedCourseData.learn_type}
                          </Badge>
                          {selectedLessonData && (
                            <Badge variant="outline">
                              {selectedLessonData.lessonTitle || selectedLessonData.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedCourseData.courseDesc && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedCourseData.courseDesc}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? "s" : ""}
                    </div>
                    {selectedLessonData && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Lesson: {selectedLessonData.lessonTitle || selectedLessonData.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Approval Status Message */}
                {!isCourseApproved && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Course Not Approved
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          You can only create assignments after your course is approved by the admin team.
                        </p>
                        {selectedCourseData.status === 'rejected' && selectedCourseData.rejectionReason && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <p className="text-xs font-medium mb-1">Rejection Reason:</p>
                            <p className="text-xs text-muted-foreground">{selectedCourseData.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Published Status Message */}
                {isCoursePublished && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Course Published
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          This course is live and visible to students. Any changes to assignments will affect enrolled students.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!selectedLesson || !isCourseApproved}
                  />
                </div>
              </div>
            </div>

            {!selectedLesson ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Lesson</h3>
                <p className="text-muted-foreground">
                  Please select a course, week, and lesson to view assignments
                </p>
              </div>
            ) : !isCourseApproved ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Course Not Approved</h3>
                <p className="text-muted-foreground mb-4">
                  You can only manage assignments for approved courses. Please wait for admin approval.
                </p>
                {selectedCourseData.status === 'pending_approval' && (
                  <p className="text-sm text-yellow-600">
                    Your course is currently under review.
                  </p>
                )}
              </div>
            ) : assignmentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                <p className="text-muted-foreground mb-4">This lesson has no assignments yet.</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Assignment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead className="w-[120px]">Due Date</TableHead>
                      <TableHead className="w-[100px]">Score</TableHead>
                      <TableHead className="w-[120px]">Submissions</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[120px]">Created</TableHead>
                      <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <React.Fragment key={assignment._id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleAssignmentExpansion(assignment._id)}
                            >
                              {expandedAssignment === assignment._id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{assignment.title}</div>
                              {assignment.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {assignment.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(assignment.dueDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium">{assignment.maxScore}</div>
                              <div className="text-xs text-muted-foreground">
                                Pass: {assignment.passingScore}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{assignment.meta?.submissionsCount || assignment.submissionsCount || 0}</span>
                              {(assignment.meta?.averageScore > 0 || assignment.averageScore > 0) && (
                                <Badge variant="outline" className="text-xs">
                                  Avg: {assignment.meta?.averageScore || assignment.averageScore}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(assignment)}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(assignment.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(assignment)}
                                title="Edit"
                                disabled={!isCourseApproved}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteClick(assignment)}
                                title="Delete"
                                disabled={!isCourseApproved}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Submissions Row */}
                        {expandedAssignment === assignment._id && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium">Submissions ({submissions.length})</h4>
                                </div>

                                {submissions.length === 0 ? (
                                  <div className="text-center py-8">
                                    <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                                    <p className="text-muted-foreground">No submissions yet</p>
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Student</TableHead>
                                          <TableHead className="w-[150px]">Submitted</TableHead>
                                          <TableHead className="w-[100px]">Status</TableHead>
                                          <TableHead className="w-[100px]">Score</TableHead>
                                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {submissions.map((submission) => (
                                          <TableRow key={submission._id}>
                                            <TableCell>
                                              <div>
                                                <div className="font-medium">
                                                  {submission.submittedBy?.firstname} {submission.submittedBy?.lastname}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                  {submission.submittedBy?.email}
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="text-sm">
                                                {formatDateTime(submission.createdAt)}
                                                {submission.isLate && (
                                                  <Badge variant="destructive" className="text-xs mt-1 block w-fit">
                                                    Late
                                                  </Badge>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell>{getSubmissionStatusBadge(submission)}</TableCell>
                                            <TableCell>
                                              {submission.score !== undefined && submission.score !== null ? (
                                                <div className="text-center">
                                                  <div className="font-medium">
                                                    {submission.score}/{assignment.maxScore}
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className="text-muted-foreground text-sm">Not graded</span>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex justify-end gap-1">
                                                <Link href={`/instructor-dashboard/assignments/${submission._id}`}>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title="View & Grade"
                                                    disabled={!isCourseApproved}
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </Link>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => openGradeDialog({ ...submission, assignment })}
                                                  title="Grade"
                                                  disabled={!isCourseApproved}
                                                >
                                                  <Award className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Pending Grading Tab */}
          <TabsContent value="pending-grading" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Pending Grading
                      {totalPending > 0 && (
                        <Badge variant="destructive">{totalPending} submissions</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      All submissions awaiting grading across your courses
                    </p>
                  </div>
                  <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by assignment or student..."
                      className="pl-10"
                      value={pendingSearchQuery}
                      onChange={(e) => setPendingSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pendingSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Submissions</h3>
                    <p className="text-muted-foreground">
                      All caught up! There are no submissions waiting to be graded.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSubmissions
                      .filter(
                        (item) =>
                          item.assignmentTitle?.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
                          item.courseName?.toLowerCase().includes(pendingSearchQuery.toLowerCase())
                      )
                      .map((item) => (
                        <div
                          key={item.assignmentId}
                          className="rounded-lg border bg-card overflow-hidden"
                        >
                          {/* Assignment Header */}
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-muted/30">
                            <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                              <ClipboardList className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-base truncate">
                                {item.assignmentTitle}
                              </h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.courseName}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {item.dueDate && new Date(item.dueDate) > new Date()
                                    ? `Due ${formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}`
                                    : item.dueDate
                                    ? `Overdue ${formatDistanceToNow(new Date(item.dueDate), { addSuffix: false })}`
                                    : "No due date"}
                                </span>
                              </div>
                            </div>
                            <Badge variant="destructive" className="text-sm shrink-0">
                              {item.pendingGrading} to grade
                            </Badge>
                          </div>

                          {/* Individual Submissions */}
                          <div className="divide-y">
                            {item.submissions?.map((sub) => (
                              <div
                                key={sub._id}
                                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {sub.submittedBy?.firstname} {sub.submittedBy?.lastname}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>
                                        {sub.submittedAt
                                          ? formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })
                                          : "Unknown"}
                                      </span>
                                      {sub.isLate && (
                                        <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                          Late
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Link href={`/instructor-dashboard/assignments/${sub._id}`}>
                                  <Button size="sm" variant="outline">
                                    <Award className="h-4 w-4 mr-2" />
                                    Grade
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Submissions Tab */}
          <TabsContent value="all-submissions" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      All Submissions
                      {totalSubmissions > 0 && (
                        <Badge variant="secondary">{totalSubmissions} total</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      View and manage all submissions across your courses
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:min-w-[250px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student or assignment..."
                        className="pl-10"
                        value={allSearchQuery}
                        onChange={(e) => setAllSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={allStatusFilter} onValueChange={setAllStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="graded">Graded</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {allLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : allSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground">
                      There are no submissions across your courses yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead className="w-[150px]">Submitted</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[100px]">Score</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSubmissions
                          .filter((submission) => {
                            // Filter by search query (backend uses 'student' not 'submittedBy')
                            const matchesSearch =
                              allSearchQuery === "" ||
                              `${submission.student?.firstname} ${submission.student?.lastname}`
                                .toLowerCase()
                                .includes(allSearchQuery.toLowerCase()) ||
                              submission.assignmentTitle
                                ?.toLowerCase()
                                .includes(allSearchQuery.toLowerCase()) ||
                              submission.courseName
                                ?.toLowerCase()
                                .includes(allSearchQuery.toLowerCase());

                            // Filter by status
                            const isGraded = submission.score !== undefined && submission.score !== null;
                            const matchesStatus =
                              allStatusFilter === "all" ||
                              (allStatusFilter === "graded" && isGraded) ||
                              (allStatusFilter === "pending" && !isGraded);

                            return matchesSearch && matchesStatus;
                          })
                          .map((submission) => {
                            const isGraded = submission.score !== undefined && submission.score !== null;
                            return (
                              <TableRow key={submission._id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {submission.student?.firstname} {submission.student?.lastname}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {submission.student?.email}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {submission.assignmentTitle || "Unknown Assignment"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {submission.courseName || "Unknown Course"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {submission.submittedAt
                                      ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })
                                      : "Unknown"}
                                  </div>
                                  {submission.isLate && (
                                    <Badge variant="destructive" className="text-[10px] px-1 py-0 mt-1">
                                      Late
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isGraded ? (
                                    <Badge className="bg-green-500 text-xs">Graded</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Pending</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isGraded ? (
                                    <div className="font-medium">
                                      {submission.score}/{submission.maxScore || 100}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end">
                                    <Link href={`/instructor-dashboard/assignments/${submission._id}`}>
                                      <Button size="sm" variant={isGraded ? "ghost" : "outline"}>
                                        {isGraded ? (
                                          <>
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                          </>
                                        ) : (
                                          <>
                                            <Award className="h-4 w-4 mr-1" />
                                            Grade
                                          </>
                                        )}
                                      </Button>
                                    </Link>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Assignment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update the assignment details below"
                  : "Create a new assignment for your course."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedCourseData && selectedLessonData && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Course: {selectedCourseData.courseTitle}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Lesson: {selectedLessonData.lessonTitle || selectedLessonData.title}
                  </p>
                  {isCoursePublished && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ This course is published. Changes will affect enrolled students.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    name="title"
                    placeholder="Assignment title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  name="description"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Score</Label>
                  <Input
                    name="maxScore"
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.maxScore}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passing Score</Label>
                  <Input
                    name="passingScore"
                    type="number"
                    min="0"
                    max={formData.maxScore}
                    value={formData.passingScore}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowLateSubmission"
                    name="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="allowLateSubmission" className="cursor-pointer">
                    Allow late submission
                  </Label>
                </div>

                {formData.allowLateSubmission && (
                  <div className="space-y-2 ml-6">
                    <Label>Late Penalty (%)</Label>
                    <Input
                      name="lateSubmissionPenalty"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.lateSubmissionPenalty}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Instructions *</Label>
                <Textarea
                  name="contents"
                  placeholder="Detailed instructions for students..."
                  rows={6}
                  value={formData.contents}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, isActive: value === "active" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Inactive assignments won't be visible to students
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSaving || !isCourseApproved}
                className={!isCourseApproved ? "cursor-not-allowed opacity-60" : ""}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grade Submission Dialog */}
        <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
            </DialogHeader>

            {selectedSubmission && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <div className="p-3 bg-muted rounded-md">
                    {selectedSubmission.submittedBy?.firstname} {selectedSubmission.submittedBy?.lastname}
                    <div className="text-sm text-muted-foreground">{selectedSubmission.submittedBy?.email}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Score *</Label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedSubmission.assignment?.maxScore || 100}
                    value={gradeData.score}
                    onChange={(e) => setGradeData((prev) => ({ ...prev, score: e.target.value }))}
                    placeholder="Enter score"
                    disabled={!isCourseApproved}
                  />
                  <p className="text-sm text-muted-foreground">
                    Max score: {selectedSubmission.assignment?.maxScore || 100}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData((prev) => ({ ...prev, feedback: e.target.value }))}
                    placeholder="Provide feedback..."
                    rows={4}
                    disabled={!isCourseApproved}
                  />
                </div>

                {selectedSubmission.isLate && selectedSubmission.assignment?.lateSubmissionPenalty > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Late Submission</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">
                      Penalty: {selectedSubmission.assignment.lateSubmissionPenalty}%
                    </p>
                  </div>
                )}

                {!isCourseApproved && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-700">
                        You can only grade submissions for approved courses.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGradeSubmit} 
                disabled={gradeSubmission.isPending || !isCourseApproved}
                className={!isCourseApproved ? "cursor-not-allowed opacity-60" : ""}
              >
                {gradeSubmission.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Grade"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{assignmentToDelete?.title}"? This will also delete all submissions for
                this assignment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteAssignment.isPending || !isCourseApproved}
              >
                {deleteAssignment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </InstructorDashboardLayout>
  );
}