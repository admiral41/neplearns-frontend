

// Updated CourseDetailsPage.js - Using assignment API for assignments
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock,
  Users,
  ChevronRight,
  Home,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  FileQuestion,
  Star,
  Timer,
  Award,
  User,
  MessageSquare,
  Youtube,
  GraduationCap,
  Target,
  BookMarked,
  TrendingUp,
  Zap,
  ClipboardList,
  Download,
  Upload,
  FileUp,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  FileCode,
  Link,
  Paperclip,
  ExternalLink,
  CalendarClock,
  AlertTriangle,
  FileCheck,
  FilePenLine,
} from "lucide-react";
import { toast } from "sonner";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
import { lessonStatusAPI } from "@/lib/api/lessonStatus";
import { assignmentAPI } from "@/lib/api/assignments";
import { liveClassAPI } from "@/lib/api/liveClasses";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import dynamic from "next/dynamic";
const DynamicContentEditor = dynamic(() => import('../../../../components/editor/ContentEditor'), {
  ssr: false,
})
const DynamicContentView = dynamic(() => import('react-froala-wysiwyg/FroalaEditorView'), {
  ssr: false,
})
export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [assignments, setAssessments] = useState([]);
  const [lessonStatuses, setLessonStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [openWeek, setOpenWeek] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Assessment/Assignment states
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedAssignment, setSelectedAssessment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [mySubmissions, setMySubmissions] = useState({});
  const [assignmentStats, setAssessmentStats] = useState({
    total: 0,
    assignments: 0,
    quizzes: 0,
    submitted: 0,
    graded: 0,
    pending: 0,
    overdue: 0,
  });

  // Rating states
  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    totalRatings: 0,
    userRating: null,
    hasRated: false,
  });
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCourseDetails();
    }
  }, [slug]);

  // Recalculate stats when assignments or submissions change
  useEffect(() => {
    if (assignments.length > 0) {
      const now = new Date();
      let stats = {
        total: assignments.length,
        assignments: assignments.length,
        quizzes: 0,
        submitted: 0,
        graded: 0,
        pending: 0,
        overdue: 0,
      };

      assignments.forEach(assignment => {
        const submission = mySubmissions[assignment._id];

        if (submission) {
          stats.submitted++;
          if (submission.grade !== undefined && submission.grade !== null) {
            stats.graded++;
          }
        } else if (assignment.dueDate && new Date(assignment.dueDate) < now) {
          stats.overdue++;
        } else {
          stats.pending++;
        }
      });

      setAssessmentStats(stats);
    }
  }, [assignments, mySubmissions]);

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true);

      const courseResponse = await courseAPI.getCourseBySlug(slug);
      const courseData = courseResponse.data;
      setCourse(courseData);

      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData)?._id : null;

      const enrolled = courseData.learners?.some(learner => {
        if (!learner) return false;
        if (typeof learner === 'object' && learner._id) {
          return learner._id === userId;
        }
        if (typeof learner === 'string') {
          return learner === userId;
        }
        return false;
      }) || false;

      setIsEnrolled(enrolled);

      if (enrolled && courseData._id) {
        await fetchCourseContent(courseData._id);
        await fetchMyAssessmentSubmissions(courseData._id);
      }

      // Fetch rating data (for enrolled users)
      if (enrolled) {
        await fetchCourseRating();
      }

    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseContent = async (courseId) => {
    try {
      // Fetch all course content in parallel (5 API calls instead of 60+)
      const [
        weeksResponse,
        lessonsResponse,
        progressResponse,
        liveClassesResponse,
        assignmentsResponse
      ] = await Promise.all([
        weekAPI.getWeeksByCourse(courseId),
        lessonAPI.getLessonsByCourse(courseId),
        lessonStatusAPI.getCourseProgress(courseId).catch(() => ({ data: [] })),
        liveClassAPI.getLiveClassesByCourse(courseId).catch(() => ({ data: [] })),
        assignmentAPI.getAssignmentsByCourse(courseId, { populate: 'lesson' }).catch(() => ({ data: [] }))
      ]);

      // Process weeks
      const weeksData = weeksResponse.data || [];
      setWeeks(weeksData);

      // Process lessons (already enriched with week info from backend)
      const allLessons = lessonsResponse.data || [];
      setLessons(allLessons);

      // Process lesson statuses into a map
      const statusMap = {};
      const progressData = progressResponse.data || [];
      progressData.forEach(status => {
        if (status.lesson) {
          const lessonId = typeof status.lesson === 'object' ? status.lesson._id : status.lesson;
          statusMap[lessonId] = status;
        }
      });
      // Set default status for lessons without status
      allLessons.forEach(lesson => {
        if (!statusMap[lesson._id]) {
          statusMap[lesson._id] = { isCompleted: false };
        }
      });
      setLessonStatuses(statusMap);

      // Process live classes
      if (liveClassesResponse.data) {
        setLiveClasses(liveClassesResponse.data);
      }

      // Process assignments
      if (assignmentsResponse.data) {
        setAssessments(assignmentsResponse.data);
      }

      // Open first week by default
      if (weeksData.length > 0) {
        setOpenWeek(weeksData[0].weekNumber);
      }

    } catch (error) {
      console.error('Error fetching course content:', error);
    }
  };

  const fetchMyAssessmentSubmissions = async (courseId) => {
    try {
      const response = await assignmentAPI.getMySubmissions({
        courseId,
        populate: 'assignment'
      });
      
      const submissionsMap = {};
      response.data?.forEach(submission => {
        if (submission.assignment) {
          submissionsMap[submission.assignment._id] = submission;
        }
      });
      
      setMySubmissions(submissionsMap);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchCourseRating = async () => {
    try {
      const response = await courseAPI.getCourseRating(slug);
      if (response.data) {
        setRatingData(response.data);
      }
    } catch (error) {
      console.error('Error fetching course rating:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (selectedRating < 1 || selectedRating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await courseAPI.rateCourse(slug, selectedRating);

      if (response.data) {
        setRatingData({
          averageRating: response.data.averageRating,
          totalRatings: response.data.totalRatings,
          userRating: response.data.userRating,
          hasRated: true,
        });
        toast.success('Thank you for rating this course!');
        setShowRatingDialog(false);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.status === 409) {
        toast.error('You have already rated this course');
      } else {
        toast.error(error.response?.data?.msg || 'Failed to submit rating');
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await courseAPI.enrollInCourse(slug);
      toast.success('Successfully enrolled!');
      setIsEnrolled(true);
      await fetchCourseDetails();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error.message || 'Failed to enroll');
    }
  };

  const handleStartLearning = (lessonId) => {
    router.push(`/student-dashboard/courses/${slug}/lessons/${lessonId}`);
  };

  const handleJoinLiveClass = (liveClassId) => {
    router.push(`/student-dashboard/courses/${slug}/live/${liveClassId}`);
  };

  const handleStartQuiz = (assignmentId) => {
    router.push(`/student-dashboard/courses/${slug}/assignments/${assignmentId}`);
  };

  // Assignment handlers using assignment API
  const handleStartAssignment = (assignmentId) => {
    const submission = mySubmissions[assignmentId];
    if (submission) {
      // View existing submission
      setSelectedSubmission(submission);
      setShowSubmissionDialog(true);
    } else {
      // Start new submission
      const assignment = assignments.find(a => a._id === assignmentId);
      if (assignment) {
        setSelectedAssessment(assignment);
        setSubmissionContent("");
        setSubmissionFiles([]);
        setShowSubmitDialog(true);
      }
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    const textContent = submissionContent ? submissionContent.replace(/<[^>]*>/g, '').trim() : '';
    if (!textContent) {
      toast.error('Please write your submission content');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const submissionData = {
        contents: submissionContent,
        attachments: submissionFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }))
      };

      await assignmentAPI.submitAssignment(selectedAssignment._id, submissionData);
      
      toast.success('Assignment submitted successfully!');
      setShowSubmitDialog(false);
      setSelectedAssessment(null);
      setSubmissionContent("");
      setSubmissionFiles([]);
      
      // Refresh data
      await fetchMyAssessmentSubmissions(course._id);
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.message || 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const calculateProgress = () => {
    const completedCount = Object.values(lessonStatuses).filter(
      status => status.isCompleted
    ).length;
    const totalCount = lessons.length;
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  };

  const getTotalLearningHours = () => {
    return lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0) / 60;
  };

  const getCompletedLessons = () => {
    return Object.values(lessonStatuses).filter(s => s.isCompleted).length;
  };

  const getUpcomingLiveClasses = () => {
    const now = new Date();
    return liveClasses.filter(lc => new Date(lc.scheduledDateTime) > now);
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getLessonAssessments = (lessonId) => {
    return assignments.filter(a => a.lesson?._id === lessonId || a.lesson === lessonId);
  };

  const getAssessmentStatus = (assignment) => {
    const submission = mySubmissions[assignment._id];
    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

    if (submission) {
      if (submission.grade !== undefined && submission.grade !== null) {
        return {
          type: 'graded',
          label: 'Graded',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          color: 'bg-green-500/10 text-green-600 dark:text-green-400',
          border: 'border-green-500/20',
          grade: submission.grade,
        };
      }
      return {
        type: 'submitted',
        label: 'Submitted',
        icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/20',
      };
    }

    if (dueDate && dueDate < now) {
      return {
        type: 'overdue',
        label: 'Overdue',
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        color: 'bg-red-500/10 text-red-600 dark:text-red-400',
        border: 'border-red-500/20',
      };
    }

    return {
      type: 'pending',
      label: 'Pending',
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-500/20',
    };
  };

  const getLiveClassStatus = (liveClass) => {
    const now = new Date();
    const scheduledTime = new Date(liveClass.scheduledDateTime);
    const endTime = new Date(scheduledTime.getTime() + (liveClass.duration || 60) * 60000);

    if (now < scheduledTime) {
      return {
        type: 'upcoming',
        label: 'Upcoming',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      };
    } else if (now >= scheduledTime && now <= endTime) {
      return {
        type: 'live',
        label: 'Live Now',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      };
    } else {
      return {
        type: 'ended',
        label: 'Ended',
        color: 'bg-muted text-muted-foreground',
      };
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const formatTimeRemaining = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Due soon';
  };

  const formatRelativeDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM dd');
    } catch (error) {
      return dateString;
    }
  };

  // Quizzes would be separate if the model had assignmentType field
  const quizzes = [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading course details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/student-dashboard/courses')}>
            Browse Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();
  const totalLearningHours = getTotalLearningHours();
  const completedLessonsCount = getCompletedLessons();
  const upcomingLiveClasses = getUpcomingLiveClasses();
  const videoId = course.embeddedUrl ? extractYouTubeVideoId(course.embeddedUrl) : null;
  const youtubeEmbedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  const hasValidVideo = !!youtubeEmbedUrl;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/student-dashboard/courses')}
                className="px-0 h-auto text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                <Home className="h-4 w-4 mr-1" />
                Courses
              </Button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium truncate">{course.courseTitle}</span>
            </nav>
          </div>

          {/* Course Header */}
          <div className="mb-6 sm:mb-8">
            {/* Category Badge */}
            <div className="mb-2 sm:mb-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-3 py-1">
                {course.category?.categoryName || 'Course'}
              </Badge>
            </div>

            {/* Course Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4 sm:mb-6">{course.courseTitle}</h1>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column - Video */}
              <div className="lg:col-span-2 order-1">
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className="aspect-video bg-gray-900 relative">
                    {youtubeEmbedUrl ? (
                      <div className="w-full h-full relative">
                        <iframe
                          src={youtubeEmbedUrl}
                          className="w-full h-full"
                          title="Course Introduction Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          <span>Course Introduction</span>
                        </div>
                      </div>
                    ) : course.image ? (
                      <div className="w-full h-full relative group">
                        <img
                          src={course.image.startsWith("http") ? course.image : `${process.env.NEXT_PUBLIC_API_URL}/${course.image}`}
                          alt={course.courseTitle}
                          className="w-full h-full object-cover"
                        />
                        {hasValidVideo && (
                          <button
                            onClick={() => setShowVideoModal(true)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors"
                          >
                            <div className="bg-white p-3 rounded-full hover:scale-110 transition-transform">
                              <PlayCircle className="h-10 w-10 text-gray-900" />
                            </div>
                          </button>
                        )}
                        {hasValidVideo && (
                          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2">
                            <PlayCircle className="h-4 w-4" />
                            <span>Watch Preview</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
                        <div className="text-center text-white p-6">
                          <BookOpen className="h-16 w-16 mx-auto mb-4" />
                          <h2 className="text-xl font-bold mb-3">{course.courseTitle}</h2>
                          {hasValidVideo && (
                            <Button
                              variant="outline"
                              className="border-white text-white hover:bg-white/10"
                              onClick={() => setShowVideoModal(true)}
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Watch Introduction
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Info Section */}
                  <div className="p-4 sm:p-6 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">Course Introduction</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                          {course.courseDesc || course.courseShortDesc || 'No description available.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium text-foreground">
                            {course.lecturers && course.lecturers.length > 0
                              ? `${course.lecturers[0].user?.firstname} ${course.lecturers[0].user?.lastname}`
                              : 'Instructor'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">Course Instructor</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t">
                      <div className="text-center p-2 bg-muted/50 rounded-lg sm:bg-transparent sm:p-0">
                        <div className="text-base sm:text-lg font-bold text-foreground">{course.duration || 0}h</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg sm:bg-transparent sm:p-0">
                        <div className="text-base sm:text-lg font-bold text-foreground">{course.totalLessons || 0}</div>
                        <div className="text-xs text-muted-foreground">Lessons</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg sm:bg-transparent sm:p-0">
                        <div className="text-base sm:text-lg font-bold text-foreground">{course.totalEnrollments || 0}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg sm:bg-transparent sm:p-0">
                        <div className="text-base sm:text-lg font-bold text-foreground">{course.weekly_study || 5}h</div>
                        <div className="text-xs text-muted-foreground">Weekly</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Progress & Rating */}
              <div className="space-y-4 sm:space-y-6 order-2">
                {/* Progress Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="font-semibold text-foreground mb-3 sm:mb-4">Learning Progress</h3>
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            className="stroke-muted"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            className="stroke-primary"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${progress * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg sm:text-2xl font-bold text-foreground">{progress}%</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Complete</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                      <div className="flex items-center justify-between bg-muted/50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                        <span className="text-xs sm:text-sm text-muted-foreground">Lessons</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                          {completedLessonsCount}/{lessons.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-muted/50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                        <span className="text-xs sm:text-sm text-muted-foreground">Study Time</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{totalLearningHours.toFixed(0)}h</span>
                      </div>
                      <div className="flex items-center justify-between bg-muted/50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                        <span className="text-xs sm:text-sm text-muted-foreground">Assignments</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{assignmentStats.submitted}/{assignmentStats.assignments}</span>
                      </div>
                      <div className="flex items-center justify-between bg-muted/50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                        <span className="text-xs sm:text-sm text-muted-foreground">Quizzes</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{assignmentStats.quizzes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rating Card - Hidden on mobile, shown inline with progress on larger screens */}
                <Card className="border-0 shadow-sm hidden sm:block">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-foreground mb-3">Course Rating</h3>
                      <div className="flex items-center justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 sm:h-6 sm:w-6 ${
                              star <= Math.round(ratingData.averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-foreground mb-1">
                        {ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : '--'}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        {ratingData.totalRatings > 0
                          ? `${ratingData.totalRatings} rating${ratingData.totalRatings > 1 ? 's' : ''}`
                          : 'No ratings yet'}
                      </p>
                      {ratingData.hasRated ? (
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <span>Your rating:</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= ratingData.userRating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-muted text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Thank you for rating!
                          </p>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setSelectedRating(0);
                            setShowRatingDialog(true);
                          }}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Rate this course
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Rating - Compact inline with progress stats */}
                <div className="flex sm:hidden items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(ratingData.averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : '--'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({ratingData.totalRatings})
                    </span>
                  </div>
                  {ratingData.hasRated ? (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Rated
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRating(0);
                        setShowRatingDialog(true);
                      }}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Rate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area with Tabs and Sidebar */}
          <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Column - Tabs Content (3 columns) */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              {/* Course Tabs */}
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide -mx-px">
                  {[
                    { key: "overview", label: "Overview", mobileLabel: "Overview" },
                    { key: "resources", label: "Resources", mobileLabel: "Content" },
                    { key: "assignments", label: "Assignments", mobileLabel: "Tasks", count: assignmentStats.assignments },
                    { key: "quizzes", label: "Quizzes", mobileLabel: "Quiz", count: assignmentStats.quizzes },
                    { key: "live-classes", label: "Live Classes", mobileLabel: "Live", count: liveClasses.length },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0
                        ${activeTab === tab.key
                          ? "border-primary text-primary bg-primary/5"
                          : "border-transparent text-muted-foreground hover:text-primary"
                        }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.mobileLabel}</span>
                        {tab.count !== undefined && (
                          <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                            {tab.count}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Course Overview</h2>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                        {course.courseDesc || "No description available."}
                      </p>

                      <div className="space-y-4 sm:space-y-6">
                        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">What You'll Learn</h3>
                            <ul className="space-y-2">
                              {course.learningOutcomes.map((outcome, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm sm:text-base text-foreground/80">{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {course.prerequisites && course.prerequisites.length > 0 && (
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">Prerequisites</h3>
                            <ul className="space-y-2">
                              {course.prerequisites.map((prereq, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm sm:text-base text-foreground/80">{prereq}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resources Tab - Show lessons as resources */}
                  {activeTab === "resources" && (
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">Course Resources</h2>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                        Access all lesson materials, videos, and downloadable resources.
                      </p>

                      {/* Weekly Lessons as Resources */}
                      <div className="space-y-3 sm:space-y-6">
                        {weeks.map((week) => {
                          const weekLessons = lessons.filter(
                            (l) => l.weekNumber === week.weekNumber
                          );
                          const isOpen = openWeek === week.weekNumber;

                          return (
                            <div key={week._id} className="border rounded-lg overflow-hidden">
                              {/* Week Header */}
                              <button
                                onClick={() =>
                                  setOpenWeek(isOpen ? null : week.weekNumber)
                                }
                                className="w-full flex justify-between items-center px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/50 hover:bg-muted"
                              >
                                <div className="text-left">
                                  <p className="text-xs sm:text-sm font-medium text-foreground">
                                    Week {week.weekNumber}: {week.weekTitle || "Resources"}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                    {weekLessons.length} lessons
                                  </p>
                                </div>

                                {isOpen ? (
                                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                                )}
                              </button>

                              {/* Lessons as Resources */}
                              {isOpen && (
                                <div className="bg-card divide-y divide-border max-h-[350px] sm:max-h-[420px] overflow-y-auto">
                                  {weekLessons.map((lesson, index) => {
                                    const isCompleted = lessonStatuses[lesson._id]?.isCompleted;
                                    const lessonAssessments = getLessonAssessments(lesson._id);

                                    return (
                                      <div key={lesson._id} className="p-2 sm:p-3">
                                        {/* Lesson Info */}
                                        <div
                                          onClick={() => handleStartLearning(lesson._id)}
                                          className="flex items-start sm:items-center justify-between cursor-pointer hover:bg-primary/5 p-2 rounded transition-colors gap-2"
                                        >
                                          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                            <PlayCircle className="h-4 w-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
                                            <div className="min-w-0">
                                              <span className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
                                                {index + 1}. {lesson.lessonTitle}
                                              </span>
                                              {lesson.shortDescription && (
                                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-2">
                                                  {lesson.shortDescription}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {isCompleted && (
                                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                            )}
                                          </div>
                                        </div>

                                        {/* Assessments for this lesson */}
                                        {lessonAssessments.length > 0 && (
                                          <div className="ml-6 sm:ml-7 mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                                            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase">
                                              Assessments:
                                            </p>
                                            {lessonAssessments.map((assignment) => (
                                              <div
                                                key={assignment._id}
                                                onClick={() => handleStartAssignment(assignment._id)}
                                                className="flex items-center justify-between px-2 py-1.5 bg-muted/50 rounded hover:bg-muted cursor-pointer"
                                              >
                                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                                  <FilePenLine className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                                                  <span className="text-xs sm:text-sm text-foreground/80 truncate">
                                                    {assignment.title}
                                                  </span>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0 ml-2">
                                                  {assignment.maxScore || 0} pts
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assignments Tab */}
                  {activeTab === "assignments" && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-foreground">Assignments</h2>
                          <p className="text-sm text-muted-foreground">Complete assignments to test your knowledge</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] sm:text-xs">
                            Done: {assignmentStats.submitted}
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] sm:text-xs">
                            Pending: {assignmentStats.pending}
                          </Badge>
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] sm:text-xs">
                            Overdue: {assignmentStats.overdue}
                          </Badge>
                        </div>
                      </div>

                      {assignments.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                          <FilePenLine className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                          <h3 className="text-sm sm:text-base font-medium text-foreground mb-2">No Assignments</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">No assignments have been created for this course yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {assignments.map((assignment) => {
                            const status = getAssessmentStatus(assignment);
                            const submission = mySubmissions[assignment._id];

                            return (
                              <Card key={assignment._id} className="border hover:border-primary/50 transition-colors">
                                <CardContent className="p-3 sm:p-6">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-start sm:items-center gap-2 mb-2">
                                        <FilePenLine className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                                        <h3 className="text-sm sm:text-base font-semibold text-foreground">{assignment.title}</h3>
                                        <Badge className={`${status.color} text-[10px] sm:text-xs`}>
                                          <div className="flex items-center gap-1">
                                            {status.icon}
                                            {status.label}
                                            {status.grade !== undefined && (
                                              <span className="ml-1">({status.grade}%)</span>
                                            )}
                                          </div>
                                        </Badge>
                                      </div>

                                      {assignment.description && (
                                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                                          {assignment.description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-sm text-muted-foreground">
                                        {assignment.dueDate && (
                                          <div className="flex items-center gap-1">
                                            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline">Due: {formatDate(assignment.dueDate)}</span>
                                            <span className="sm:hidden">{formatTimeRemaining(assignment.dueDate)}</span>
                                          </div>
                                        )}
                                        <div className="hidden sm:flex items-center gap-1">
                                          <Timer className="h-4 w-4" />
                                          <span>{formatTimeRemaining(assignment.dueDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span>{assignment.maxScore || 0} pts</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                      <Button
                                        onClick={() => handleStartAssignment(assignment._id)}
                                        variant={submission ? "outline" : "default"}
                                        size="sm"
                                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                                      >
                                        {submission ? (
                                          <>
                                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">View Submission</span>
                                            <span className="sm:hidden">View</span>
                                          </>
                                        ) : (
                                          <>
                                            <FileUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Start Assignment</span>
                                            <span className="sm:hidden">Start</span>
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  {assignment.instructions && (
                                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                                      <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2">Instructions</h4>
                                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                        <div dangerouslySetInnerHTML={{ __html: assignment.instructions }} />
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quizzes Tab */}
                  {activeTab === "quizzes" && (
                    <div>
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-foreground">Quizzes</h2>
                          <p className="text-sm text-muted-foreground">Test your knowledge with interactive quizzes</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          Total: {quizzes.length}
                        </Badge>
                      </div>

                      {quizzes.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                          <FileQuestion className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                          <h3 className="text-sm sm:text-base font-medium text-foreground mb-2">No Quizzes</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">No quizzes have been created for this course yet.</p>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                          {quizzes.map((quiz) => {
                            const status = getAssessmentStatus(quiz);
                            const submission = mySubmissions[quiz._id];

                            return (
                              <Card key={quiz._id} className="border hover:border-purple-500/50 transition-colors">
                                <CardContent className="p-3 sm:p-6">
                                  <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                                    <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                                      <FileQuestion className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 shrink-0 mt-0.5" />
                                      <div className="min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1">{quiz.title}</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">{quiz.description}</p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className={`${status.color} text-[10px] sm:text-xs shrink-0`}>
                                      {status.label}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                                    <div className="flex items-center justify-between bg-muted/50 rounded p-1.5 sm:p-2">
                                      <span>Questions</span>
                                      <span className="font-medium text-foreground">{quiz.questions?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-muted/50 rounded p-1.5 sm:p-2">
                                      <span>Duration</span>
                                      <span className="font-medium text-foreground">{quiz.timeLimit || 30}m</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-muted/50 rounded p-1.5 sm:p-2">
                                      <span>Points</span>
                                      <span className="font-medium text-foreground">{quiz.maxScore || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-muted/50 rounded p-1.5 sm:p-2">
                                      <span>Attempts</span>
                                      <span className="font-medium text-foreground">{quiz.maxAttempts || 1}</span>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => handleStartQuiz(quiz._id)}
                                    className="w-full text-xs sm:text-sm"
                                    size="sm"
                                    variant={submission ? "outline" : "default"}
                                  >
                                    {submission ? 'Review Quiz' : 'Start Quiz'}
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live Classes Tab */}
                  {activeTab === "live-classes" && (
                    <div>
                      <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-foreground">Live Classes</h2>
                          <p className="text-sm text-muted-foreground">Join interactive live sessions with instructors</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] sm:text-xs">
                          Upcoming: {upcomingLiveClasses.length}
                        </Badge>
                      </div>

                      {liveClasses.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                          <Video className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                          <h3 className="text-sm sm:text-base font-medium text-foreground mb-2">No Live Classes</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">No live classes have been scheduled for this course yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {liveClasses.map((liveClass) => {
                            const status = getLiveClassStatus(liveClass);

                            return (
                              <Card key={liveClass._id} className="border hover:border-primary/50 transition-colors">
                                <CardContent className="p-3 sm:p-6">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 sm:mb-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-start sm:items-center gap-2 mb-2">
                                        <Video className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
                                        <h3 className="text-sm sm:text-base font-semibold text-foreground">{liveClass.title}</h3>
                                        <Badge className={`${status.color} text-[10px] sm:text-xs`}>
                                          {status.label}
                                        </Badge>
                                      </div>

                                      {liveClass.description && (
                                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                                          {liveClass.description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span>{formatDate(liveClass.scheduledDateTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
                                          <span>{liveClass.duration || 60}m</span>
                                        </div>
                                        {liveClass.platform === 'zoom' && (
                                          <div className="hidden sm:flex items-center gap-1">
                                            <Link className="h-4 w-4" />
                                            <span>Zoom</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                      {status.type === 'live' ? (
                                        <Button
                                          onClick={() => handleJoinLiveClass(liveClass._id)}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none text-xs sm:text-sm"
                                        >
                                          <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                          Join Now
                                        </Button>
                                      ) : status.type === 'upcoming' ? (
                                        <Button
                                          onClick={() => handleJoinLiveClass(liveClass._id)}
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 sm:flex-none text-xs sm:text-sm"
                                        >
                                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                          <span className="hidden sm:inline">Add to Calendar</span>
                                          <span className="sm:hidden">Remind</span>
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          disabled
                                          className="flex-1 sm:flex-none text-xs sm:text-sm"
                                        >
                                          <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                          Ended
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {liveClass.joinUrl && status.type === 'live' && (
                                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Meeting Link:</span>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="p-0 h-auto text-xs sm:text-sm"
                                          onClick={() => window.open(liveClass.joinUrl, '_blank')}
                                        >
                                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                          Join
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar (1 column) - Hidden on mobile */}
            <div className="hidden lg:block space-y-6">
              {/* Quick Actions Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Quick Actions</h3>
                    <Badge variant="outline" className="text-xs text-muted-foreground">Coming Soon</Badge>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start opacity-60"
                      disabled
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Calendar
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start opacity-60"
                      disabled
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Course Discussions
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start opacity-60"
                      disabled
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Print Syllabus
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Upcoming Deadlines</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {assignments
                      .filter(a => a.dueDate && !mySubmissions[a._id])
                      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                      .slice(0, 5)
                      .map((assignment) => {
                        const dueDate = new Date(assignment.dueDate);
                        const now = new Date();
                        const isOverdue = dueDate < now;
                        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

                        return (
                          <div key={assignment._id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <FilePenLine className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">
                                  {assignment.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Due: {formatDate(assignment.dueDate)}
                                </p>
                              </div>
                            </div>
                            <Badge variant={isOverdue ? "destructive" : "outline"}>
                              {isOverdue ? 'Overdue' : `${daysUntilDue}d`}
                            </Badge>
                          </div>
                        );
                      })}

                    {assignments.filter(a => a.dueDate && !mySubmissions[a._id]).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No upcoming deadlines</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Live Classes Schedule */}
              {upcomingLiveClasses.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Next Live Class</h3>
                    <div className="space-y-3">
                      {upcomingLiveClasses.slice(0, 1).map((liveClass) => (
                        <div key={liveClass._id} className="bg-primary/10 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="h-5 w-5 text-primary" />
                            <h4 className="font-medium text-foreground">{liveClass.title}</h4>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(liveClass.scheduledDateTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span>{liveClass.duration || 60} mins</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoinLiveClass(liveClass._id)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                          >
                            Set Reminder
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Submissions */}
              {Object.keys(mySubmissions).length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Recent Submissions</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.values(mySubmissions)
                        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                        .slice(0, 3)
                        .map((submission) => (
                          <div key={submission._id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              {submission.grade !== undefined ? (
                                <FileCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <FilePenLine className="h-4 w-4 text-primary" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">
                                  {submission.assignment?.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {formatRelativeDate(submission.submittedAt)}
                                </p>
                              </div>
                            </div>
                            {submission.grade !== undefined && (
                              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
                                {submission.grade}%
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Spacing at bottom */}
          <div className="mt-8"></div>
        </div>

        {/* Video Modal */}
        {showVideoModal && hasValidVideo && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-foreground">Course Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVideoModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={youtubeEmbedUrl}
                  className="w-full h-full"
                  title="Course Introduction Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Assignment Submission Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Complete and submit your assignment. Make sure to review the instructions carefully.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-6 py-2">
              {selectedAssignment && (
                <>
                  {/* Assignment Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{selectedAssignment.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {selectedAssignment.dueDate && (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>Due: {formatDate(selectedAssignment.dueDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>{selectedAssignment.maxScore || 0} points</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  {(selectedAssignment.contents || selectedAssignment.description) && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-medium text-foreground mb-2">Instructions</h4>
                      {selectedAssignment.description && (
                        <p className="text-sm text-muted-foreground mb-3">{selectedAssignment.description}</p>
                      )}
                      {selectedAssignment.contents && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: selectedAssignment.contents }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content Editor */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Your Submission Content
                    </label>
                    <div className="border rounded-lg overflow-hidden">
                      <DynamicContentEditor
                        model={submissionContent}
                        handleModelChange={setSubmissionContent}
                        allowPaste={true}
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Attach Files (Optional)
                    </label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="assignment-files"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="assignment-files"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload files or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PDF, DOC, PPT, images, or ZIP files (max 10MB each)
                        </span>
                      </label>
                    </div>

                    {/* File List */}
                    {submissionFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Files to upload ({submissionFiles.length})
                        </p>
                        <div className="space-y-2">
                          {submissionFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter className="flex justify-between items-center border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAssignment}
                disabled={isSubmitting || (!submissionContent || submissionContent.replace(/<[^>]*>/g, '').trim() === '')}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submission View Dialog */}
        <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Your Submission</DialogTitle>
              <DialogDescription>
                View your submitted assignment and feedback
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 py-2">
              {selectedSubmission && selectedSubmission.assignment && (
                <>
                  {/* Submission Info */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {selectedSubmission.assignment.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            <span>Submitted: {formatDate(selectedSubmission.submittedAt)}</span>
                          </div>
                          {selectedSubmission.grade !== undefined && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span className="font-medium">
                                Grade: {selectedSubmission.grade}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge
                        className={
                          selectedSubmission.grade !== undefined
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-primary/10 text-primary'
                        }
                      >
                        {selectedSubmission.grade !== undefined ? 'Graded' : 'Submitted'}
                      </Badge>
                    </div>

                    {/* Instructor Feedback */}
                    {selectedSubmission.feedback && (
                      <div className="border rounded-lg p-4 bg-yellow-500/10">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Instructor Feedback
                        </h4>
                        <p className="text-foreground/80">{selectedSubmission.feedback}</p>
                      </div>
                    )}

                    {/* Submitted Content */}
                    {selectedSubmission.contents && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Your Submission</h4>
                        <div className="border rounded-lg p-4 bg-card">
                          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedSubmission.contents }} />
                        </div>
                      </div>
                    )}

                    {/* Submitted Files */}
                    {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Attached Files</h4>
                        <div className="space-y-2">
                          {selectedSubmission.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">{attachment.name || `File ${index + 1}`}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => attachment.url && window.open(attachment.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSubmissionDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Course Rating Dialog */}
        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rate this Course</DialogTitle>
              <DialogDescription>
                Share your experience with this course. Your rating helps other students.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  How would you rate this course?
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      type="button"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                          star <= selectedRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-muted text-muted hover:fill-yellow-200 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-medium text-foreground">
                  {selectedRating === 0 && 'Select a rating'}
                  {selectedRating === 1 && 'Poor'}
                  {selectedRating === 2 && 'Fair'}
                  {selectedRating === 3 && 'Good'}
                  {selectedRating === 4 && 'Very Good'}
                  {selectedRating === 5 && 'Excellent'}
                </p>
              </div>

              <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  You can only rate this course once. Your rating cannot be changed later.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRatingDialog(false)}
                disabled={isSubmittingRating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmittingRating || selectedRating === 0}
              >
                {isSubmittingRating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Submit Rating
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}