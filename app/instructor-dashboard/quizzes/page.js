"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Users,
  BarChart3,
  Eye,
  Edit,
  Copy,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Link as LinkIcon,
  Layers,
  Target,
  Timer,
  Sparkles,
  FolderOpen,
  Loader2,
  AlertTriangle,
  Lock,
  Check,
  X,
} from "lucide-react";
import {
  useCourseQuizzes,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useToggleQuizPublish,
  useDuplicateQuiz,
} from "@/lib/hooks/useInstructor";
import { courseAPI } from "@/lib/api/courses";

export default function InstructorQuizzesPage() {
  const router = useRouter();
  const { showAlert } = useAlertDialog();

  // State
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState([]);

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

  // Fetch quizzes for selected course
  const { data: quizzesData, isLoading: quizzesLoading, refetch: refetchQuizzes } = useCourseQuizzes(selectedCourse);
  const quizzes = quizzesData?.data || [];

  // Mutations
  const deleteQuiz = useDeleteQuiz();
  const togglePublish = useToggleQuizPublish();
  const duplicateQuiz = useDuplicateQuiz();

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);
  const isCourseApproved = selectedCourseData ? 
    (selectedCourseData.status === 'approved' || selectedCourseData.status === 'published') : false;
  const isCoursePublished = selectedCourseData ? selectedCourseData.published : false;

  // Statistics
  const stats = {
    total: quizzes.length,
    active: quizzes.filter((q) => q.isPublished).length,
    draft: quizzes.filter((q) => !q.isPublished).length,
    totalResponses: quizzes.reduce((sum, q) => sum + (q.responsesCount || 0), 0),
    avgCompletionRate:
      quizzes.length > 0
        ? quizzes.reduce((sum, q) => sum + (q.completionRate || 0), 0) / quizzes.length
        : 0,
  };

  // Filter quizzes
  const filteredQuizzes = quizzes
    .filter((quiz) => {
      // Search filter
      if (searchQuery) {
        const matchesSearch =
          quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatus !== "all") {
        const now = new Date();
        if (selectedStatus === "active") {
          return (
            quiz.isPublished &&
            (!quiz.startDate || now >= new Date(quiz.startDate)) &&
            (!quiz.endDate || now <= new Date(quiz.endDate))
          );
        }
        if (selectedStatus === "draft") return !quiz.isPublished;
        if (selectedStatus === "upcoming") {
          return quiz.startDate && now < new Date(quiz.startDate);
        }
        if (selectedStatus === "ended") {
          return quiz.endDate && now > new Date(quiz.endDate);
        }
      }

      return true;
    });

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

  const handleCreateQuiz = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    if (!isCourseApproved) {
      toast.error("You can only create quizzes for approved courses");
      return;
    }

    router.push(`/instructor-dashboard/quizzes/new?course=${selectedCourse}`);
  };

  const handleDeleteQuiz = (quiz) => {
    if (!isCourseApproved) {
      toast.error("You can only delete quizzes for approved courses");
      return;
    }

    showAlert({
      title: "Delete Quiz",
      description: `Are you sure you want to delete "${quiz.title}"? This will also delete all questions and student attempts.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        deleteQuiz.mutate(quiz._id, {
          onSuccess: () => refetchQuizzes(),
          onError: (error) => {
            toast.error(error.message || "Failed to delete quiz");
          }
        });
      },
    });
  };

  const handleDuplicateQuiz = async (quiz) => {
    if (!isCourseApproved) {
      toast.error("You can only duplicate quizzes for approved courses");
      return;
    }

    duplicateQuiz.mutate(quiz._id, {
      onSuccess: () => {
        refetchQuizzes();
        toast.success("Quiz duplicated successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to duplicate quiz");
      }
    });
  };

  const handleTogglePublish = async (quiz) => {
    if (!isCourseApproved) {
      toast.error("You can only publish/unpublish quizzes for approved courses");
      return;
    }

    togglePublish.mutate(quiz._id, {
      onSuccess: () => {
        refetchQuizzes();
        toast.success(`Quiz ${quiz.isPublished ? 'unpublished' : 'published'} successfully!`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update quiz status");
      }
    });
  };

  const getStatusBadge = (quiz) => {
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

    if (!quiz.isPublished) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700">
          <FileText className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    } else if (startDate && now < startDate) {
      return (
        <Badge className="bg-blue-500">
          <Calendar className="h-3 w-3 mr-1" />
          Upcoming
        </Badge>
      );
    } else if (endDate && now > endDate) {
      return (
        <Badge className="bg-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          Ended
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
  };

  const getResponseRate = (quiz) => {
    if (!quiz.responsesCount) return 0;
    const enrolledStudents = quiz.course?.enrolledStudents || 1;
    return Math.min(100, Math.round((quiz.responsesCount / enrolledStudents) * 100));
  };

  const copyQuizLink = (quiz) => {
    const link = `${window.location.origin}/quiz/${quiz._id}`;
    navigator.clipboard.writeText(link);
    toast.success("Quiz link copied to clipboard!");
  };

  const navigateToQuiz = (path) => {
    if (!isCourseApproved) {
      toast.error("You can only manage quizzes for approved courses");
      return;
    }
    router.push(path);
  };

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Quiz Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create and manage quizzes for your approved courses
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetchQuizzes()}
              disabled={!selectedCourse}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleCreateQuiz}
              disabled={!selectedCourse || !isCourseApproved}
              className={!isCourseApproved ? "cursor-not-allowed opacity-60" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Quiz
              {!isCourseApproved && (
                <Lock className="h-3 w-3 ml-2" />
              )}
            </Button>
          </div>
        </div>

        {/* Course Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Course</label>
              {isLoadingCourses ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course to view quizzes" />
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

            {selectedCourseData && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-lg">{selectedCourseData.courseTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getCourseStatusBadge(selectedCourseData)}
                          <Badge variant="outline">
                            {selectedCourseData.learn_type}
                          </Badge>
                          <Badge variant="outline">
                            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {selectedCourseData.courseDesc && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedCourseData.courseDesc}
                      </p>
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
                          You can only create quizzes after your course is approved by the admin team.
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
                          This course is live and visible to students. Any changes to quizzes will affect enrolled students.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards - Only show when course is selected */}
        {selectedCourse && isCourseApproved && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Quizzes</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Draft</p>
                    <p className="text-2xl font-bold">{stats.draft}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Responses</p>
                    <p className="text-2xl font-bold">{stats.totalResponses}</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Completion</p>
                    <p className="text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters - Only show when course is selected and approved */}
        {selectedCourse && isCourseApproved && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search quizzes by title or description..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quizzes Grid */}
        {!selectedCourse ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
              <p className="text-muted-foreground">
                Please select a course to view and manage quizzes
              </p>
            </CardContent>
          </Card>
        ) : !isCourseApproved ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Course Not Approved</h3>
              <p className="text-muted-foreground mb-4">
                You can only manage quizzes for approved courses. Please wait for admin approval.
              </p>
              {selectedCourseData.status === 'pending_approval' && (
                <p className="text-sm text-yellow-600">
                  Your course is currently under review.
                </p>
              )}
            </CardContent>
          </Card>
        ) : quizzesLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first quiz for this course"}
              </p>
              <Button
                onClick={handleCreateQuiz}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-1">{quiz.title}</CardTitle>
                        {getStatusBadge(quiz)}
                      </div>
                      {quiz.description && (
                        <CardDescription className="line-clamp-2">
                          {quiz.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => window.open(`/quiz/${quiz._id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigateToQuiz(`/instructor-dashboard/quizzes/${quiz._id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigateToQuiz(`/instructor-dashboard/quizzes/${quiz._id}/results`)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyQuizLink(quiz)}>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDuplicateQuiz(quiz)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(quiz)}>
                          {quiz.isPublished ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteQuiz(quiz)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Week Info */}
                  {quiz.week && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Layers className="h-3 w-3" />
                        <span>Week {quiz.week?.weekNumber}: {quiz.week?.title}</span>
                      </div>
                    </div>
                  )}

                  {/* Quiz Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{quiz.questions?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{quiz.responsesCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Responses</div>
                    </div>
                  </div>

                  {/* Response Rate */}
                  {quiz.responsesCount > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Response Rate</span>
                        <span className="font-medium">{getResponseRate(quiz)}%</span>
                      </div>
                      <Progress value={getResponseRate(quiz)} className="h-2" />
                    </div>
                  )}

                  {/* Quiz Settings Summary */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quiz.isTimed && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Timer className="h-3 w-3" />
                        {quiz.duration}min
                      </Badge>
                    )}
                    {quiz.passingScore && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Target className="h-3 w-3" />
                        Pass: {quiz.passingScore}%
                      </Badge>
                    )}
                    {quiz.maxAttempts > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {quiz.maxAttempts} attempts
                      </Badge>
                    )}
                  </div>

                  {/* Schedule Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    {quiz.startDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Starts: {new Date(quiz.startDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <div>Available immediately</div>
                    )}
                    {quiz.endDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Ends: {new Date(quiz.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>

                <Separator />

                <div className="p-4">
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigateToQuiz(`/instructor-dashboard/quizzes/${quiz._id}/results`)}
                      disabled={!isCourseApproved}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Results
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigateToQuiz(`/instructor-dashboard/quizzes/${quiz._id}/edit`)}
                      disabled={!isCourseApproved}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </InstructorDashboardLayout>
  );
}