"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  FileText,
  Clock,
  BookOpen,
  Calendar,
  Target,
  FileQuestion,
  ArrowRight,
  PlayCircle,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  Edit,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { lessonAPI } from "@/lib/api/lessons";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonStatusAPI } from "@/lib/api/lessonStatus";
import { assignmentAPI } from "@/lib/api/assignments";
import dynamic from "next/dynamic";

// Dynamic imports for editors
const DynamicContentEditor = dynamic(() => import('@/components/editor/ContentEditor'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

const DynamicContentView = dynamic(() => import('react-froala-wysiwyg/FroalaEditorView'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { slug, lessonId } = params;

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("lesson");
  const [assignments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [userSubmissions, setUserSubmissions] = useState({});
  const [hasFetchedAssessments, setHasFetchedAssessments] = useState(false);

  // Modal states
  const [selectedAssignment, setSelectedAssessment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch lesson and course data
  useEffect(() => {
    if (lessonId && slug) {
      fetchLessonData();
    }
  }, [lessonId, slug]);

  const fetchLessonData = async () => {
    try {
      setIsLoading(true);

      // Fetch lesson details
      const lessonResponse = await lessonAPI.getLessonById(lessonId);
      const lessonData = lessonResponse.data;
      setLesson(lessonData);

      // Fetch lesson status
      try {
        const statusResponse = await lessonStatusAPI.getLessonStatus(lessonId);
        setIsCompleted(statusResponse.data?.completed || statusResponse.data?.isCompleted || false);
      } catch (error) {
        console.error('Error fetching lesson status:', error);
        setIsCompleted(false);
      }

      // Fetch course details
      const courseResponse = await courseAPI.getCourseBySlug(slug);
      const courseData = courseResponse.data;
      setCourse(courseData);

      // Fetch all lessons for this course for navigation
      if (courseData._id) {
        const weeksResponse = await weekAPI.getWeeksByCourse(courseData._id);
        const weeks = weeksResponse.data || [];

        const allLessonsList = [];
        let currentIndex = 0;

        for (const week of weeks) {
          try {
            const lessonsResponse = await lessonAPI.getWeekLessons(week._id);
            if (lessonsResponse.data) {
              const weekLessons = lessonsResponse.data.map(l => ({
                ...l,
                weekNumber: week.weekNumber
              }));

              const lessonIndex = weekLessons.findIndex(l => l._id === lessonData._id);
              if (lessonIndex !== -1) {
                currentIndex = allLessonsList.length + lessonIndex;
              }

              allLessonsList.push(...weekLessons);
            }
          } catch (error) {
            console.error(`Error fetching lessons for week ${week._id}:`, error);
          }
        }

        setAllLessons(allLessonsList);
        setCurrentLessonIndex(currentIndex);
      }

    } catch (error) {
      console.error('Error fetching lesson data:', error);
      toast.error('Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssessments = useCallback(async () => {
    if (hasFetchedAssessments) {
      return;
    }

    try {
      setLoadingAssessments(true);

      const response = await assignmentAPI.getAssignmentsByLesson(lessonId);

      // Parse the response - check all possible structures
      let assignmentsData = [];

      if (Array.isArray(response)) {
        assignmentsData = response;
      } else if (response && Array.isArray(response.data)) {
        assignmentsData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        assignmentsData = response.data.data;
      } else if (response?.data?.assignments && Array.isArray(response.data.assignments)) {
        assignmentsData = response.data.assignments;
      }

      // Update state BEFORE marking as fetched
      setAssessments(assignmentsData);

      // Fetch user submissions for these assignments
      if (assignmentsData.length > 0) {
        await fetchUserSubmissions(assignmentsData);
      }

      // Mark as fetched AFTER everything succeeds
      setHasFetchedAssessments(true);

    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to load tasks');
    } finally {
      setLoadingAssessments(false);
    }
  }, [lessonId, hasFetchedAssessments]);

  const fetchUserSubmissions = async (assignmentsList) => {
    try {
      const submissionsMap = {};

      try {
        const mySubmissions = await assignmentAPI.getMySubmissions();

        let submissionsData = [];

        if (Array.isArray(mySubmissions)) {
          submissionsData = mySubmissions;
        } else if (Array.isArray(mySubmissions.data)) {
          submissionsData = mySubmissions.data;
        } else if (mySubmissions.data && Array.isArray(mySubmissions.data.data)) {
          submissionsData = mySubmissions.data.data;
        }

        if (submissionsData && submissionsData.length > 0) {
          submissionsData.forEach(submission => {
            if (submission.assignment) {
              const assignmentId = submission.assignment._id || submission.assignment;
              submissionsMap[assignmentId] = submission;
            }
          });
        }
      } catch (error) {
        // No user submissions found
      }

      setUserSubmissions(submissionsMap);
    } catch (error) {
      // Error fetching user submissions
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Fetch assignments only when task tab is selected
    if (tab === "task" && !hasFetchedAssessments) {
      fetchAssessments();
    }
  };

  const handleMarkComplete = async () => {
    try {
      setIsMarkingComplete(true);

      await lessonStatusAPI.markLessonComplete(lessonId);

      toast.success('Lesson marked as complete!');
      setIsCompleted(true);

    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to mark lesson as complete');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      router.push(`/student-dashboard/courses/${slug}/lessons/${prevLesson._id}`);
    }
  };

  const handleNextLesson = () => {
    if (!isCompleted) {
      toast.error("Please complete this lesson first");
      return;
    }

    if (currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      router.push(`/student-dashboard/courses/${slug}/lessons/${nextLesson._id}`);
    } else {
      toast.success('Course completed!');
      router.push(`/student-dashboard/courses/${slug}`);
    }
  };

  const handleOpenViewModal = (assignment) => {
    const submission = userSubmissions[assignment._id];
    if (!submission) return;
    
    setSelectedAssessment(assignment);
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleOpenEditModal = (assignment) => {
    const submission = userSubmissions[assignment._id];
    if (!submission) return;
    
    setSelectedAssessment(assignment);
    setSelectedSubmission(submission);
    setSubmissionContent(submission.contents || "");
    setShowEditModal(true);
  };

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssessment(assignment);
    setSubmissionContent("");
    setShowEditModal(true);
  };

  const handleSubmitAssessment = async () => {
    if (!selectedAssignment) return;

    // Basic check - make sure there's some content
    if (!submissionContent || submissionContent.trim() === '' || submissionContent.trim() === '<p><br></p>') {
      toast.error("Please provide your submission content");
      return;
    }

    try {
      setSubmitting(true);

      const submissionData = {
        contents: submissionContent,
      };

      const existingSubmission = userSubmissions[selectedAssignment._id];
      
      if (existingSubmission) {
        // Update existing submission
        await assignmentAPI.updateSubmission(existingSubmission._id, submissionData);
        toast.success('Submission updated successfully!');
      } else {
        // Create new submission
        await assignmentAPI.submitAssignment(selectedAssignment._id, submissionData);
        toast.success('Assessment submitted successfully!');
      }

      setShowEditModal(false);
      setSelectedAssessment(null);
      setSelectedSubmission(null);
      setSubmissionContent("");

      // Refresh submissions
      setHasFetchedAssessments(false);
      await fetchAssessments();

    } catch (error) {
      console.error('Error submitting assignment:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.msg || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = userSubmissions[assignmentId];

    if (!submission) return 'not_started';

    if (submission.graded || submission.score !== undefined) {
      const passingScore = submission.assignment?.passingScore || 50;
      return submission.score >= passingScore ? 'passed' : 'failed';
    }

    return 'submitted';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'submitted':
        return <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />;
      default:
        return <PlayCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'passed':
        return 'Completed';
      case 'failed':
        return 'Failed - Retry Available';
      case 'submitted':
        return 'Submitted - Awaiting Grade';
      default:
        return 'Not Started';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'submitted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // View Modal Component
  const ViewSubmissionModal = () => {
    if (!showViewModal || !selectedAssignment || !selectedSubmission) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardContent className="p-0">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    View Submission: {selectedAssignment.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Target className="h-3 w-3 mr-1" />
                      Max Score: {selectedAssignment.maxScore || 100}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due: {formatDate(selectedAssignment.dueDate)}
                    </Badge>
                    {selectedSubmission.score !== undefined && (
                      <Badge className={selectedSubmission.score >= (selectedAssignment.passingScore || 50) ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Score: {selectedSubmission.score}/{selectedAssignment.maxScore}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAssessment(null);
                    setSelectedSubmission(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Assessment Instructions */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Assignment Instructions</h3>
                {selectedAssignment.description && (
                  <p className="text-sm text-blue-700 mb-3">{selectedAssignment.description}</p>
                )}
                <div className="prose prose-sm max-w-none text-blue-700">
                  {selectedAssignment.contents ? (
                    <DynamicContentView model={selectedAssignment.contents} />
                  ) : (
                    <p>Complete the assignment based on the lesson content.</p>
                  )}
                </div>
              </div>

              {/* Submission Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Your Submission</h3>
                  <div className="text-sm text-gray-600">
                    Submitted on: {formatDate(selectedSubmission.submittedAt || selectedSubmission.createdAt)}
                  </div>
                </div>

                {selectedSubmission.contents ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="prose prose-lg max-w-none">
                      <DynamicContentView model={selectedSubmission.contents} />
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No submission content available</p>
                  </div>
                )}
              </div>

              {/* Feedback Section (if graded) */}
              {selectedSubmission.feedback && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Instructor Feedback</h3>
                  <div className="prose prose-sm max-w-none text-green-700">
                    <DynamicContentView model={selectedSubmission.feedback} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedSubmission.score !== undefined ? 'Graded submission' : 'Submitted and awaiting grade'}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenEditModal(selectedAssignment);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Submission
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedAssessment(null);
                      setSelectedSubmission(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Edit/Submit Modal Component
  const EditSubmissionModal = () => {
    if (!showEditModal || !selectedAssignment) return null;

    const isEditing = !!selectedSubmission;
    const modalTitle = isEditing ? 'Edit Submission' : 'Submit Assignment';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardContent className="p-0">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {modalTitle}: {selectedAssignment.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Max Score: {selectedAssignment.maxScore || 100} | Due: {formatDate(selectedAssignment.dueDate)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAssessment(null);
                    setSelectedSubmission(null);
                    setSubmissionContent("");
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Assessment Instructions */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
                {selectedAssignment.description && (
                  <p className="text-sm text-blue-700 mb-3">{selectedAssignment.description}</p>
                )}
                <div className="prose prose-sm max-w-none text-blue-700">
                  {selectedAssignment.contents ? (
                    <DynamicContentView model={selectedAssignment.contents} />
                  ) : (
                    <p>Complete the assignment based on the lesson content.</p>
                  )}
                </div>
              </div>

              {/* Submission Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Submission <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <DynamicContentEditor
                    model={submissionContent}
                    handleModelChange={setSubmissionContent}
                    allowPaste={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use the editor to format your submission. You can add text, images, code snippets, and more...
                </p>
              </div>

              {/* Simple Submission Note */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Submission Note</p>
                    <p className="text-xs text-gray-600">
                      Please write your complete submission in the editor above. You can use the formatting tools to add structure, images, code, and other content directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {isEditing ? 'Update your submission' : 'Click submit to send your assignment for grading'}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAssessment(null);
                      setSelectedSubmission(null);
                      setSubmissionContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAssessment}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {isEditing ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {isEditing ? 'Update Submission' : 'Submit Assignment'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading lesson...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson || !course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold mb-2">Lesson Not Found</h2>
          <p className="text-gray-600 mb-4">The lesson you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push(`/student-dashboard/courses/${slug}`)}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasPreviousLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex < allLessons.length - 1;
  const lessonDuration = formatDuration(lesson.duration);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/student-dashboard/courses')}
                className="px-0 h-auto text-gray-600 hover:text-gray-900 hover:bg-transparent text-xs sm:text-sm shrink-0"
              >
                Courses
              </Button>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/student-dashboard/courses/${slug}`)}
                className="px-0 h-auto text-gray-600 hover:text-gray-900 hover:bg-transparent text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[200px]"
              >
                {course.courseTitle}
              </Button>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-gray-900 font-medium truncate">Lesson {currentLessonIndex + 1}</span>
            </nav>
          </div>

          {/* Lesson Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              {lesson.lessonTitle}
            </h1>

            {lesson.shortDescription && (
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">{lesson.shortDescription}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] sm:text-xs">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </Badge>
              {lessonDuration && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {lessonDuration}
                </Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] sm:text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4 sm:mb-6">
            <div className="flex overflow-x-auto scrollbar-hide gap-1 sm:gap-6">
            <button
              onClick={() => handleTabChange("lesson")}
              className={`pb-2.5 sm:pb-3 px-3 sm:px-1 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${activeTab === "lesson"
                ? "text-blue-600 bg-blue-50 sm:bg-transparent rounded-t-lg sm:rounded-none"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span className="hidden sm:inline">Lesson Content</span>
              <span className="sm:hidden">Lesson</span>
              {activeTab === "lesson" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange("task")}
              className={`pb-2.5 sm:pb-3 px-3 sm:px-1 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${activeTab === "task"
                ? "text-blue-600 bg-blue-50 sm:bg-transparent rounded-t-lg sm:rounded-none"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span className="hidden sm:inline">Tasks & Assignments</span>
              <span className="sm:hidden">Tasks</span>
              {activeTab === "task" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange("resources")}
              className={`pb-2.5 sm:pb-3 px-3 sm:px-1 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${activeTab === "resources"
                ? "text-blue-600 bg-blue-50 sm:bg-transparent rounded-t-lg sm:rounded-none"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span className="hidden sm:inline">Additional Resources</span>
              <span className="sm:hidden">Resources</span>
              {activeTab === "resources" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="mb-6 sm:mb-8">
          {/* Lesson Tab */}
          {activeTab === "lesson" && (
            <div className="space-y-4 sm:space-y-6">
              {lesson.shortDescription && (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      Lesson Overview
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{lesson.shortDescription}</p>
                  </CardContent>
                </Card>
              )}

              {lesson.lessonContent ? (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-3 sm:p-6">
                    <div className="prose prose-sm sm:prose-lg max-w-none overflow-x-auto">
                      <DynamicContentView model={lesson.lessonContent} />
                    </div>
                  </CardContent>
                </Card>
              ) : lesson.videoUrl ? (
                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="aspect-video bg-black">
                    <video
                      controls
                      className="w-full h-full"
                      src={lesson.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </Card>
              ) : (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Lesson Content</h3>
                    <p className="text-sm sm:text-base text-gray-600">Content will be added soon.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Task Tab */}
          {activeTab === "task" && (
            <div>
              {loadingAssessments ? (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-900 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600">Loading tasks...</p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Tasks & Assignments</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      Complete these tasks to reinforce your learning.
                    </p>

                    {assignments.length === 0 && !loadingAssessments && (
                      <div className="mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start sm:items-center gap-2">
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
                          <p className="text-xs sm:text-sm text-blue-700">
                            No tasks assigned for this lesson yet. Check back later.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {assignments.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      {assignments.map((assignment) => {
                        const status = getSubmissionStatus(assignment._id);
                        const submission = userSubmissions[assignment._id];
                        const isSubmitted = status === 'submitted' || status === 'failed' || status === 'passed';

                        return (
                          <Card key={assignment._id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-3 sm:p-6">
                              <div className="flex flex-col gap-4 sm:gap-6">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                      <FileQuestion className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">
                                        {assignment.title}
                                      </h3>
                                      <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                                        {assignment.description && (
                                          <p className="mb-2">{assignment.description}</p>
                                        )}
                                        {assignment.contents ? (
                                          <div className="prose prose-sm max-w-none">
                                            <DynamicContentView model={assignment.contents} />
                                          </div>
                                        ) : !assignment.description ? (
                                          "Complete this assignment to demonstrate your understanding."
                                        ) : null}
                                      </div>

                                      {/* Assignment Details */}
                                      <div className="flex flex-wrap gap-1.5 sm:gap-3 mb-3 sm:mb-4">
                                        {assignment.maxScore && (
                                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs">
                                            <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                            Max: {assignment.maxScore}
                                          </Badge>
                                        )}

                                        {assignment.passingScore && (
                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs">
                                            <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                            Pass: {assignment.passingScore}
                                          </Badge>
                                        )}

                                        {assignment.dueDate && (
                                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] sm:text-xs">
                                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                            {formatDate(assignment.dueDate)}
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Submission Status */}
                                      {submission && (
                                        <div className={`p-2 sm:p-3 rounded-lg border ${getStatusColor(status)}`}>
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(status)}
                                              <span className="text-xs sm:text-sm font-medium">{getStatusText(status)}</span>
                                            </div>

                                            {submission.score !== undefined && (
                                              <div className="flex items-center gap-2">
                                                <Badge
                                                  variant={status === 'passed' ? 'default' : 'destructive'}
                                                  className="text-[10px] sm:text-sm"
                                                >
                                                  {submission.score}/{assignment.maxScore}
                                                </Badge>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 w-full sm:w-auto sm:min-w-[140px]">
                                  {!isSubmitted ? (
                                    <Button
                                      onClick={() => handleOpenSubmitModal(assignment)}
                                      className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-xs sm:text-sm"
                                      size="sm"
                                    >
                                      <span className="hidden sm:inline">Start Task</span>
                                      <span className="sm:hidden">Start</span>
                                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                                    </Button>
                                  ) : status === 'submitted' ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1 sm:flex-none text-xs sm:text-sm"
                                        onClick={() => handleOpenViewModal(assignment)}
                                      >
                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        View
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-gray-800 flex-1 sm:flex-none text-xs sm:text-sm"
                                        onClick={() => handleOpenEditModal(assignment)}
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                    </>
                                  ) : status === 'failed' ? (
                                    <>
                                      <Button
                                        onClick={() => handleOpenEditModal(assignment)}
                                        className="bg-orange-600 hover:bg-orange-700 flex-1 sm:flex-none text-xs sm:text-sm"
                                        size="sm"
                                      >
                                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        Retry
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 sm:flex-none text-xs sm:text-sm"
                                        onClick={() => handleOpenViewModal(assignment)}
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Details
                                      </Button>
                                    </>
                                  ) : status === 'passed' ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-300 text-green-700 hover:bg-green-50 flex-1 sm:flex-none text-xs sm:text-sm"
                                        onClick={() => handleOpenViewModal(assignment)}
                                      >
                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        Results
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-gray-800 flex-1 sm:flex-none text-xs sm:text-sm"
                                        onClick={() => handleOpenEditModal(assignment)}
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div>
              {lesson.attachments && lesson.attachments.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Additional Resources</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Download supplementary materials to enhance your learning.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    {lesson.attachments.map((attachment, index) => (
                      <Card key={index} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                  {attachment.name || `Resource ${index + 1}`}
                                </p>
                                {attachment.type && (
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    {attachment.type.toUpperCase()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-300 hover:border-blue-300 shrink-0"
                              onClick={() => {
                                if (attachment.url) {
                                  window.open(attachment.url, '_blank');
                                } else {
                                  toast.error("Download link not available");
                                }
                              }}
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No Additional Resources</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      There are no additional resources available for this lesson.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* View Modal */}
        <ViewSubmissionModal />

        {/* Edit/Submit Modal */}
        <EditSubmissionModal />

        {/* Bottom Section - Completion Status and Navigation */}
        <div className="border-t border-gray-200 pt-4 sm:pt-8">
          {/* Completion Status */}
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="text-sm sm:text-base font-medium text-green-700">Lesson marked as complete!</span>
            </div>
          ) : (
            <div className="flex justify-center mb-4 sm:mb-6">
              <Button
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
                className="bg-green-600 hover:bg-green-700 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base w-full sm:w-auto sm:min-w-[200px]"
                size="default"
              >
                {isMarkingComplete ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    <span className="hidden sm:inline">Marking as Complete...</span>
                    <span className="sm:hidden">Completing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Mark Lesson as Complete</span>
                    <span className="sm:hidden">Mark Complete</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousLesson}
              disabled={!hasPreviousLesson}
              className="border-gray-300 w-full sm:w-auto order-2 sm:order-1 text-xs sm:text-sm"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Previous Lesson</span>
              <span className="sm:hidden">Previous</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm order-1 sm:order-2 w-full sm:w-auto justify-center">
              <span className="text-gray-600">
                {currentLessonIndex + 1}/{allLessons.length}
              </span>
              <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${((currentLessonIndex + 1) / allLessons.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <Button
              onClick={handleNextLesson}
              size="sm"
              disabled={!hasNextLesson || !isCompleted}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-3 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Next Lesson</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}