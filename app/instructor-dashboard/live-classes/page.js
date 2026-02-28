"use client";

import { useState, useEffect, Suspense } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Video,
  Plus,
  Search,
  Edit,
  Play,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Bell,
  PlayCircle,
  StopCircle,
  CalendarDays,
  Timer,
  AlertTriangle,
  Lock,
  Check,
  X,
  FileText,
  ExternalLink,
  Globe,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { format, parseISO, differenceInMinutes, formatDistanceToNow } from "date-fns";
import {
  useCourseLiveClasses,
  useCreateLiveClass,
  useUpdateLiveClass,
  useStartLiveClass,
  useEndLiveClass,
  useCancelLiveClass,
  useSendLiveClassReminder,
} from "@/lib/hooks/useInstructor";
import instructorService from "@/lib/services/instructor.service";
import { courseAPI } from "@/lib/api/courses";
import { livestreamAPI } from "@/lib/api/livestream";

function InstructorLiveClassesContent() {
  const { showAlert } = useAlertDialog();
  const searchParams = useSearchParams();
  const courseFromUrl = searchParams.get("course");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClass, setExpandedClass] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState([]);
  const [meetingInfo, setMeetingInfo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
    meetingType: "google_meet",
    meetingUrl: "",
    meetingId: "",
    meetingPassword: "",
    meetingInstructions: "",
    isPublic: false,
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

  // Handle course selection from URL parameter
  useEffect(() => {
    if (courseFromUrl && courses.length > 0 && !selectedCourse) {
      const course = courses.find(c => c._id === courseFromUrl);
      if (course) {
        setSelectedCourse(courseFromUrl);
        // Auto-open create dialog if course is approved
        if (course.status === 'approved' || course.published) {
          setTimeout(() => setIsDialogOpen(true), 500);
        }
      }
    }
  }, [courseFromUrl, courses, selectedCourse]);

  // Fetch livestreams for selected course
  const fetchLiveClasses = async () => {
    if (!selectedCourse) return [];
    
    try {
      const response = await livestreamAPI.getLivestreamsByCourse(selectedCourse);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching livestreams:', error);
      toast.error('Failed to load live classes');
      return [];
    }
  };

  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  useEffect(() => {
    const loadLiveClasses = async () => {
      if (!selectedCourse) return;
      
      setIsLoadingClasses(true);
      const classes = await fetchLiveClasses();
      setLiveClasses(classes);
      setIsLoadingClasses(false);
    };

    loadLiveClasses();
  }, [selectedCourse]);

  const refetchClasses = async () => {
    if (!selectedCourse) return;
    
    setIsLoadingClasses(true);
    const classes = await fetchLiveClasses();
    setLiveClasses(classes);
    setIsLoadingClasses(false);
  };

  const now = new Date();
  const selectedCourseData = courses.find((c) => c._id === selectedCourse);
  const isCourseApproved = selectedCourseData ? 
    (selectedCourseData.status === 'approved' || selectedCourseData.status === 'published') : false;
  const isCoursePublished = selectedCourseData ? selectedCourseData.published : false;

  // Calculate stats
  const stats = {
    total: liveClasses.length,
    upcoming: liveClasses.filter((lc) => lc.status === "scheduled").length,
    ongoing: liveClasses.filter((lc) => lc.status === "live").length,
    ended: liveClasses.filter((lc) => lc.status === "ended").length,
    cancelled: liveClasses.filter((lc) => lc.status === "cancelled").length,
  };

  // Separate ongoing and upcoming classes
  const ongoingClasses = liveClasses.filter((lc) => lc.status === "live");
  const upcomingClasses = liveClasses.filter(
    (lc) => lc.status === "scheduled" && new Date(lc.scheduledStartTime) > now
  );

  // Initialize form
  const initializeForm = () => {
    const startTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    // Pre-populate title and description from selected course
    const courseTitle = selectedCourseData?.courseTitle || "";
    const courseDesc = selectedCourseData?.courseDesc || "";

    setFormData((prev) => ({
      ...prev,
      title: courseTitle ? `${courseTitle} - Live Session` : "",
      description: courseDesc ? courseDesc.substring(0, 200) : "",
      scheduledStartTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
      scheduledEndTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      course: selectedCourse || "",
    }));
  };

  useEffect(() => {
    if (isDialogOpen && !isEditing) {
      initializeForm();
    }
  }, [isDialogOpen, isEditing, selectedCourse]);

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
      course: selectedCourse || "",
      scheduledStartTime: "",
      scheduledEndTime: "",
      meetingType: "google_meet",
      meetingUrl: "",
      meetingId: "",
      meetingPassword: "",
      meetingInstructions: "",
      isPublic: false,
    });
    setIsEditing(false);
    setEditingClass(null);
  };

  const openCreateDialog = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    if (!isCourseApproved) {
      toast.error("You can only create live classes for approved courses");
      return;
    }

    resetForm();
    initializeForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (liveClass) => {
    if (!isCourseApproved) {
      toast.error("You can only edit live classes for approved courses");
      return;
    }

    setFormData({
      title: liveClass.title,
      description: liveClass.description || "",
      course: liveClass.course?._id || liveClass.course,
      scheduledStartTime: liveClass.scheduledStartTime ? 
        format(parseISO(liveClass.scheduledStartTime), "yyyy-MM-dd'T'HH:mm") : "",
      scheduledEndTime: liveClass.scheduledEndTime ? 
        format(parseISO(liveClass.scheduledEndTime), "yyyy-MM-dd'T'HH:mm") : "",
      meetingType: liveClass.meetingType || "google_meet",
      meetingUrl: liveClass.meetingUrl || "",
      meetingId: liveClass.meetingId || "",
      meetingPassword: liveClass.meetingPassword || "",
      meetingInstructions: liveClass.meetingInstructions || "",
      isPublic: liveClass.isPublic || false,
    });
    setEditingClass(liveClass);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Live class title is required");
      return;
    }
    if (!formData.scheduledStartTime) {
      toast.error("Scheduled start time is required");
      return;
    }
    if (!formData.meetingUrl) {
      toast.error("Meeting URL is required");
      return;
    }
    
    // Validate URL format
    try {
      new URL(formData.meetingUrl);
    } catch (error) {
      toast.error("Please enter a valid meeting URL");
      return;
    }

    if (!isCourseApproved) {
      toast.error("You can only create live classes for approved courses");
      return;
    }

    const startTime = new Date(formData.scheduledStartTime);
    if (startTime < new Date()) {
      toast.error("Scheduled time cannot be in the past");
      return;
    }

    const classData = {
      title: formData.title,
      description: formData.description,
      course: formData.course || selectedCourse,
      scheduledStartTime: startTime.toISOString(),
      scheduledEndTime: formData.scheduledEndTime ? 
        new Date(formData.scheduledEndTime).toISOString() : null,
      meetingType: formData.meetingType,
      meetingUrl: formData.meetingUrl,
      meetingId: formData.meetingId || undefined,
      meetingPassword: formData.meetingPassword || undefined,
      meetingInstructions: formData.meetingInstructions || undefined,
      isPublic: formData.isPublic,
    };

    try {
      if (isEditing && editingClass) {
        await livestreamAPI.updateLivestream(editingClass.streamSlug, classData);
        toast.success("Live class updated successfully!");
      } else {
        await livestreamAPI.createLivestream(classData);
        toast.success("Live class created successfully!");
      }

      setIsDialogOpen(false);
      resetForm();
      await refetchClasses();
    } catch (error) {
      console.error('Error saving live class:', error);
      toast.error(error.message || "Failed to save live class");
    }
  };

  const handleStartClass = async (liveClass) => {
    if (!isCourseApproved) {
      toast.error("You can only start live classes for approved courses");
      return;
    }

    try {
      await livestreamAPI.startLivestream(liveClass.streamSlug);
      toast.success("Live class started successfully!");
      await refetchClasses();
    } catch (error) {
      console.error('Error starting live class:', error);
      toast.error(error.message || "Failed to start live class");
    }
  };

  const handleEndClass = (liveClass) => {
    if (!isCourseApproved) {
      toast.error("You can only end live classes for approved courses");
      return;
    }

    showAlert({
      title: "End Live Class",
      description: `Are you sure you want to end "${liveClass.title}"?`,
      confirmText: "End Class",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await livestreamAPI.endLivestream(liveClass.streamSlug);
          toast.success("Live class ended successfully!");
          await refetchClasses();
        } catch (error) {
          console.error('Error ending live class:', error);
          toast.error(error.message || "Failed to end live class");
        }
      },
    });
  };

  const handleJoinClass = async (liveClass) => {
    if (!isCourseApproved) {
      toast.error("You can only join live classes for approved courses");
      return;
    }

    try {
      const response = await livestreamAPI.joinLivestream(liveClass.streamSlug);
      const { meetingInfo } = response.data || {};
      
      if (meetingInfo) {
        setMeetingInfo({
          ...meetingInfo,
          liveClass
        });
      } else {
        toast.error("Failed to get meeting information");
      }
    } catch (error) {
      console.error('Error joining live class:', error);
      toast.error(error.message || "Failed to join live class");
    }
  };

  const handleCopyMeetingLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Meeting link copied to clipboard!");
    } catch (error) {
      console.error('Error copying meeting link:', error);
      toast.error("Failed to copy meeting link");
    }
  };

  const handleCancelClass = (liveClass) => {
    if (!isCourseApproved) {
      toast.error("You can only cancel live classes for approved courses");
      return;
    }

    showAlert({
      title: "Cancel Live Class",
      description: `Are you sure you want to cancel "${liveClass.title}"? Students will be notified.`,
      confirmText: "Cancel Class",
      cancelText: "Go Back",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await livestreamAPI.deleteLivestream(liveClass.streamSlug);
          toast.success("Live class cancelled successfully!");
          await refetchClasses();
        } catch (error) {
          console.error('Error cancelling live class:', error);
          toast.error(error.message || "Failed to cancel live class");
        }
      },
    });
  };

  const handleSendReminder = (liveClass) => {
    if (!isCourseApproved) {
      toast.error("You can only send reminders for approved courses");
      return;
    }

    toast.info("Reminder feature coming soon!");
  };

  const toggleClassExpansion = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const getStatusBadge = (liveClass) => {
    const scheduledDate = new Date(liveClass.scheduledStartTime);

    switch (liveClass.status) {
      case "scheduled":
        if (scheduledDate < now) {
          return (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "live":
        return (
          <Badge className="bg-green-500">
            <PlayCircle className="h-3 w-3 mr-1" />
            Live Now
          </Badge>
        );
      case "ended":
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{liveClass.status || "Unknown"}</Badge>;
    }
  };

  const getTimeStatus = (liveClass) => {
    const scheduledDate = new Date(liveClass.scheduledStartTime);
    const endDate = liveClass.scheduledEndTime ? new Date(liveClass.scheduledEndTime) : 
      new Date(scheduledDate.getTime() + 60 * 60000); // Default 1 hour

    if (liveClass.status === "live") {
      const minutesLeft = Math.max(0, differenceInMinutes(endDate, now));
      return `${minutesLeft} min left`;
    }

    if (liveClass.status === "scheduled") {
      if (scheduledDate < now) {
        return "Started";
      }
      return formatDistanceToNow(scheduledDate, { addSuffix: true });
    }

    return format(scheduledDate, "PPpp");
  };

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "MMM dd, yyyy • hh:mm a");
    } catch {
      return "Invalid Date";
    }
  };

  const getMeetingPlatformInfo = (liveClass) => {
    switch(liveClass.meetingType) {
      case 'zoom':
        return {
          name: 'Zoom',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968865.png',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'google_meet':
        return {
          name: 'Google Meet',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'microsoft_teams':
        return {
          name: 'Microsoft Teams',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968885.png',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50'
        };
      default:
        return {
          name: 'Custom Meeting',
          icon: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  // Filter classes
  const filteredClasses = liveClasses.filter((lc) => {
    // Search filter
    if (searchQuery) {
      const matchesSearch =
        lc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lc.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all" && lc.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Live Classes</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Schedule and manage external meeting live classes for your approved courses
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={refetchClasses}
              disabled={isLoadingClasses || !selectedCourse}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingClasses ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button 
              onClick={openCreateDialog} 
              disabled={!selectedCourse || !isCourseApproved}
              className={!isCourseApproved ? "cursor-not-allowed opacity-60" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Live Class
              {!isCourseApproved && (
                <Lock className="h-3 w-3 ml-2" />
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards - Only show when course is selected and approved */}
        {selectedCourse && isCourseApproved && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Classes</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Video className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Live Now</p>
                    <p className="text-2xl font-bold text-green-600">{stats.ongoing}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ended</p>
                    <p className="text-2xl font-bold">{stats.ended}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Course Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                {isLoadingCourses ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course to manage live classes" />
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

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search live classes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!selectedCourse || !isCourseApproved}
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={!selectedCourse || !isCourseApproved}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live Now</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCourseData && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Video className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-lg">{selectedCourseData.courseTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getCourseStatusBadge(selectedCourseData)}
                          <Badge variant="outline">
                            {selectedCourseData.learn_type}
                          </Badge>
                          {liveClasses.length > 0 && (
                            <Badge variant="outline">
                              {liveClasses.length} live class{liveClasses.length !== 1 ? "es" : ""}
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
                      {liveClasses.length} live class{liveClasses.length !== 1 ? "es" : ""}
                    </div>
                    {selectedCourseData.enrolledStudents?.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedCourseData.enrolledStudents.length} enrolled students
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
                          You can only create live classes after your course is approved by the admin team.
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
                          This course is live and visible to students. Any scheduled live classes will be visible to enrolled students.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ongoing Classes */}
        {ongoingClasses.length > 0 && isCourseApproved && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <PlayCircle className="h-5 w-5" />
                Live Now ({ongoingClasses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ongoingClasses.map((liveClass) => {
                  const platform = getMeetingPlatformInfo(liveClass);
                  return (
                    <Card key={liveClass._id} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold">{liveClass.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={`${platform.bgColor} ${platform.color} border-0`}>
                                  <img src={platform.icon} alt={platform.name} className="h-3 w-3 mr-1" />
                                  {platform.name}
                                </Badge>
                              </div>
                            </div>
                            <Badge className="bg-green-500 animate-pulse">
                              <PlayCircle className="h-3 w-3 mr-1" />
                              LIVE
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Timer className="h-3 w-3" />
                              <span>{getTimeStatus(liveClass)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-3 w-3" />
                              <span>{liveClass.participants?.filter(p => !p.leftAt).length || 0} attendees</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleJoinClass(liveClass)}
                              disabled={!isCourseApproved}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Join Meeting
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEndClass(liveClass)}
                              disabled={!isCourseApproved}
                            >
                              <StopCircle className="h-3 w-3 mr-1" />
                              End
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Live Classes</h3>
                <span className="text-sm text-muted-foreground">
                  Showing {filteredClasses.length} of {liveClasses.length}
                </span>
              </div>
            </div>

            {!selectedCourse ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
                <p className="text-muted-foreground">
                  Please select a course to view and manage live classes
                </p>
              </div>
            ) : !isCourseApproved ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Course Not Approved</h3>
                <p className="text-muted-foreground mb-4">
                  You can only manage live classes for approved courses. Please wait for admin approval.
                </p>
                {selectedCourseData.status === 'pending_approval' && (
                  <p className="text-sm text-yellow-600">
                    Your course is currently under review.
                  </p>
                )}
              </div>
            ) : isLoadingClasses ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No live classes found</h3>
                <p className="text-muted-foreground mb-4">
                  No live classes found for this course. Create your first one!
                </p>
                <Button onClick={openCreateDialog} disabled={!isCourseApproved}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Live Class
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Live Class</TableHead>
                      <TableHead className="w-[200px]">Schedule</TableHead>
                      <TableHead className="w-[100px]">Access</TableHead>
                      <TableHead className="w-[120px]">Attendees</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((liveClass) => {
                      const platform = getMeetingPlatformInfo(liveClass);
                      return (
                        <React.Fragment key={liveClass._id}>
                          <TableRow className="hover:bg-muted/50">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleClassExpansion(liveClass._id)}
                                disabled={!isCourseApproved}
                              >
                                {expandedClass === liveClass._id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{liveClass.title}</div>
                                {liveClass.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {liveClass.description}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`${platform.bgColor} ${platform.color} border-0`}>
                                    <img src={platform.icon} alt={platform.name} className="h-3 w-3 mr-1" />
                                    {platform.name}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDateTime(liveClass.scheduledStartTime)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getTimeStatus(liveClass)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {liveClass.isPublic ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Enrolled Only
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{liveClass.participants?.filter(p => !p.leftAt).length || 0}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({liveClass.totalViews || 0} views)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(liveClass)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                {liveClass.status === "scheduled" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleStartClass(liveClass)}
                                      title="Start Class"
                                      disabled={!isCourseApproved}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleSendReminder(liveClass)}
                                      title="Send Reminder"
                                      disabled={!isCourseApproved}
                                    >
                                      <Bell className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEditDialog(liveClass)}
                                      title="Edit"
                                      disabled={!isCourseApproved}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleCancelClass(liveClass)}
                                      title="Cancel"
                                      disabled={!isCourseApproved}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}

                                {liveClass.status === "live" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleJoinClass(liveClass)}
                                      title="Join Meeting"
                                      disabled={!isCourseApproved}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleEndClass(liveClass)}
                                      title="End Class"
                                      disabled={!isCourseApproved}
                                    >
                                      <StopCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}

                                {(liveClass.status === "scheduled" || liveClass.status === "live") && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleCopyMeetingLink(liveClass.meetingUrl)}
                                    title="Copy Meeting Link"
                                    disabled={!isCourseApproved}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Details */}
                          {expandedClass === liveClass._id && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={7} className="p-0">
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Class Details</h4>
                                        <div className="space-y-3">
                                          <div>
                                            <span className="text-sm text-muted-foreground">Description:</span>
                                            <div className="text-sm mt-1">
                                              {liveClass.description || "No description provided"}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-sm text-muted-foreground">Course:</span>
                                            <div className="text-sm">
                                              {selectedCourseData?.courseTitle || 'Unknown Course'}
                                            </div>
                                          </div>
                                          {liveClass.week && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Week:</span>
                                              <div className="text-sm">
                                                Week {liveClass.week?.weekNumber}: {liveClass.week?.title}
                                              </div>
                                            </div>
                                          )}
                                          {liveClass.lesson && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Lesson:</span>
                                              <div className="text-sm">
                                                {liveClass.lesson?.lessonTitle}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Class Statistics</h4>
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Total Views:</span>
                                            <span className="font-medium">{liveClass.totalViews || 0}</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Active Participants:</span>
                                            <span className="font-medium">
                                              {liveClass.participants?.filter(p => !p.leftAt).length || 0}
                                            </span>
                                          </div>
                                          {liveClass.actualStartTime && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm">Actual Duration:</span>
                                              <span className="font-medium">
                                                {liveClass.actualStartTime && liveClass.actualEndTime 
                                                  ? `${Math.round((new Date(liveClass.actualEndTime) - new Date(liveClass.actualStartTime)) / 60000)} mins`
                                                  : 'N/A'
                                                }
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Meeting Information</h4>
                                        <div className="space-y-3">
                                          <div>
                                            <span className="text-sm text-muted-foreground">Platform:</span>
                                            <div className="flex items-center gap-2 mt-1">
                                              <img src={platform.icon} alt={platform.name} className="h-5 w-5" />
                                              <span className="font-medium">{platform.name}</span>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <span className="text-sm text-muted-foreground">Meeting URL:</span>
                                            <div className="text-sm mt-1">
                                              <div className="flex items-center gap-2">
                                                <a 
                                                  href={liveClass.meetingUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-primary hover:underline flex items-center gap-1 break-all"
                                                >
                                                  {liveClass.meetingUrl}
                                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                </a>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => handleCopyMeetingLink(liveClass.meetingUrl)}
                                                  title="Copy meeting link"
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {liveClass.meetingId && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Meeting ID:</span>
                                              <div className="text-sm font-mono bg-muted p-2 rounded mt-1">
                                                {liveClass.meetingId}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {liveClass.meetingPassword && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Meeting Password:</span>
                                              <div className="text-sm font-mono bg-muted p-2 rounded mt-1">
                                                {liveClass.meetingPassword}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {liveClass.meetingInstructions && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Instructions:</span>
                                              <div className="text-sm mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                {liveClass.meetingInstructions}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {liveClass.recordingUrl && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Recording:</span>
                                              <div className="text-sm">
                                                <a 
                                                  href={liveClass.recordingUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-primary hover:underline flex items-center gap-1"
                                                >
                                                  View Recording
                                                  <ExternalLink className="h-3 w-3" />
                                                </a>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                                    {liveClass.status === 'scheduled' && (
                                      <>
                                        <Button
                                          onClick={() => handleStartClass(liveClass)}
                                        >
                                          <Play className="h-4 w-4 mr-2" />
                                          Start Class
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleSendReminder(liveClass)}
                                        >
                                          <Bell className="h-4 w-4 mr-2" />
                                          Send Reminder
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleJoinClass(liveClass)}
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Preview Meeting
                                        </Button>
                                      </>
                                    )}

                                    {liveClass.status === 'live' && (
                                      <>
                                        <Button
                                          onClick={() => handleJoinClass(liveClass)}
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Join Meeting
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleEndClass(liveClass)}
                                        >
                                          <StopCircle className="h-4 w-4 mr-2" />
                                          End Class
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleCopyMeetingLink(liveClass.meetingUrl)}
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copy Meeting Link
                                        </Button>
                                      </>
                                    )}

                                    {liveClass.status === 'ended' && liveClass.recordingUrl && (
                                      <Button
                                        variant="outline"
                                        onClick={() => window.open(liveClass.recordingUrl, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Recording
                                      </Button>
                                    )}

                                    {liveClass.status === 'scheduled' && (
                                      <Button
                                        variant="outline"
                                        onClick={() => openEditDialog(liveClass)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </Button>
                                    )}

                                    {liveClass.status === 'scheduled' && (
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleCancelClass(liveClass)}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Class
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        {upcomingClasses.length > 0 && isCourseApproved && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming Live Classes ({upcomingClasses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingClasses.slice(0, 5).map((liveClass) => {
                  const platform = getMeetingPlatformInfo(liveClass);
                  return (
                    <div
                      key={liveClass._id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-md">
                          <img src={platform.icon} alt={platform.name} className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{liveClass.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(liveClass.scheduledStartTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getTimeStatus(liveClass)}</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleCopyMeetingLink(liveClass.meetingUrl)}
                          disabled={!isCourseApproved}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Live Class" : "Create New Live Class"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update the live class details below"
                  : "Schedule a new external meeting live class for your approved course."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {selectedCourseData && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Course: {selectedCourseData.courseTitle}
                  </p>
                  {isCoursePublished && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ This course is published. Scheduled live classes will be visible to enrolled students.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Class Title *</Label>
                  <Input
                    name="title"
                    placeholder="e.g., Introduction to JavaScript - Live Session"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={!isCourseApproved}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    name="description"
                    placeholder="What will this live class cover?"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    disabled={!isCourseApproved}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meeting Type *</Label>
                    <Select
                      value={formData.meetingType}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        meetingType: value,
                        // Clear meeting ID and password when switching away from zoom/custom
                        meetingId: (value === 'zoom' || value === 'custom') ? prev.meetingId : '',
                        meetingPassword: (value === 'zoom' || value === 'custom') ? prev.meetingPassword : '',
                      }))}
                      disabled={!isCourseApproved}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google_meet">Google Meet</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="microsoft_teams">Microsoft Teams</SelectItem>
                        <SelectItem value="custom">Custom Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Meeting URL *</Label>
                    <Input
                      name="meetingUrl"
                      placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
                      value={formData.meetingUrl}
                      onChange={handleInputChange}
                      disabled={!isCourseApproved}
                    />
                  </div>
                </div>

                {(formData.meetingType === 'zoom' || formData.meetingType === 'custom') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Meeting ID (Optional)</Label>
                      <Input
                        name="meetingId"
                        placeholder="123 456 7890"
                        value={formData.meetingId}
                        onChange={handleInputChange}
                        disabled={!isCourseApproved}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Meeting Password (Optional)</Label>
                      <Input
                        name="meetingPassword"
                        type="password"
                        placeholder="Enter meeting password"
                        value={formData.meetingPassword}
                        onChange={handleInputChange}
                        disabled={!isCourseApproved}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Instructions (Optional)</Label>
                  <Textarea
                    name="meetingInstructions"
                    placeholder="e.g., Please join 5 minutes early, use headphones, mute microphone..."
                    value={formData.meetingInstructions}
                    onChange={handleInputChange}
                    rows={2}
                    disabled={!isCourseApproved}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scheduled Start Time *</Label>
                    <Input
                      name="scheduledStartTime"
                      type="datetime-local"
                      value={formData.scheduledStartTime}
                      onChange={handleInputChange}
                      disabled={!isCourseApproved}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scheduled End Time (Optional)</Label>
                    <Input
                      name="scheduledEndTime"
                      type="datetime-local"
                      value={formData.scheduledEndTime}
                      onChange={handleInputChange}
                      disabled={!isCourseApproved}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Class Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic">Public Class</Label>
                      <p className="text-sm text-muted-foreground">
                        Anyone with the link can join (not just enrolled students)
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isPublic: checked }))
                      }
                      disabled={!isCourseApproved}
                    />
                  </div>
                </div>

                {!isCourseApproved && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-700">
                        You can only create live classes for approved courses.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isCourseApproved}
                className={!isCourseApproved ? "cursor-not-allowed opacity-60" : ""}
              >
                {isEditing ? "Update" : "Create"} Live Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Meeting Info Dialog */}
        {meetingInfo && (
          <Dialog open={!!meetingInfo} onOpenChange={(open) => !open && setMeetingInfo(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Join Meeting
                </DialogTitle>
                <DialogDescription>
                  {meetingInfo.liveClass?.title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <img src={meetingInfo.icon} alt={meetingInfo.platform} className="h-8 w-8" />
                  <div>
                    <div className="font-medium">{meetingInfo.platform}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCourseData?.courseTitle}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Meeting Information</Label>
                  <div className="text-sm space-y-1">
                    {meetingInfo.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Meeting ID:</span>
                        <span className="font-mono">{meetingInfo.id}</span>
                      </div>
                    )}
                    
                    {meetingInfo.hasPassword && (
                      <div className="flex items-center gap-2">
                        <Key className="h-3 w-3" />
                        <span>Password protected</span>
                      </div>
                    )}
                    
                    {meetingInfo.instructions && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        {meetingInfo.instructions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setMeetingInfo(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  window.open(meetingInfo.url, '_blank');
                  setMeetingInfo(null);
                }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in {meetingInfo.platform}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </InstructorDashboardLayout>
  );
}

export default function InstructorLiveClassesPage() {
  return (
    <Suspense
      fallback={
        <InstructorDashboardLayout>
          <div className="px-4 py-6 sm:py-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </InstructorDashboardLayout>
      }
    >
      <InstructorLiveClassesContent />
    </Suspense>
  );
}