"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogTrigger,
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
import {
  Video,
  Plus,
  Search,
  Edit,
  Trash2,
  Play,
  Users,
  Calendar,
  Clock,
  Eye,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Download,
  RefreshCw,
  Bell,
  FileText,
  Zap,
  Pause,
  PlayCircle,
  StopCircle,
  Link,
  CalendarDays,
  Timer,
  UserCheck,
  BarChart3,
  Filter,
  CalendarIcon,
  Globe,
  Lock,
  Mic,
  VideoIcon,
  ScreenShare,
  MessageSquare,
  Shield,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
import { livestreamAPI } from "@/lib/api/livestream";
import { format, parseISO, isPast, isFuture, differenceInMinutes, formatDistanceToNow } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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

function LivestreamsContent() {
  const { showAlert } = useAlertDialog();
  const searchParams = useSearchParams();
  const courseFromUrl = searchParams.get("course");

  const [courses, setCourses] = useState([]);
  const [livestreams, setLivestreams] = useState([]);
  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [ongoingStreams, setOngoingStreams] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState("all-courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStream, setExpandedStream] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [meetingInfo, setMeetingInfo] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    week: "no-week",
    lesson: "no-lesson",
    scheduledStartTime: "",
    scheduledEndTime: "",
    meetingType: "google_meet",
    meetingUrl: "",
    meetingId: "",
    meetingPassword: "",
    meetingInstructions: "",
    isPublic: false,
  });

  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  // Calculate stats from livestreams
  const calculateStats = useCallback((streams) => {
    const now = new Date();
    
    const stats = {
      total: streams.length,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0
    };

    streams.forEach(stream => {
      switch (stream.status) {
        case 'scheduled':
          const startTime = new Date(stream.scheduledStartTime);
          if (startTime > now) {
            stats.upcoming++;
          }
          break;
        case 'live':
          stats.ongoing++;
          break;
        case 'ended':
          stats.completed++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }, []);

  // Initialize form with current time + 1 hour
  const initializeForm = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 2 hours from now

    // Pre-populate title and description from selected course
    const courseTitle = selectedCourseData?.courseTitle || "";
    const courseDesc = selectedCourseData?.courseDesc || "";

    setFormData(prev => ({
      ...prev,
      title: courseTitle ? `${courseTitle} - Live Session` : "",
      description: courseDesc ? courseDesc.substring(0, 200) : "",
      scheduledStartTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
      scheduledEndTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      course: selectedCourse !== "all-courses" ? selectedCourse : ""
    }));
  };

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle course selection from URL parameter
  useEffect(() => {
    if (courseFromUrl && courses.length > 0 && selectedCourse === "all-courses") {
      const course = courses.find(c => c._id === courseFromUrl);
      if (course) {
        setSelectedCourse(courseFromUrl);
        // Auto-open create dialog
        setTimeout(() => setIsDialogOpen(true), 500);
      }
    }
  }, [courseFromUrl, courses, selectedCourse]);

  // Fetch weeks when course changes
  useEffect(() => {
    const fetchWeeksForForm = async () => {
      if (formData.course && formData.course !== "no-week") {
        await fetchWeeks(formData.course);
      } else {
        setAvailableWeeks([]);
        setAvailableLessons([]);
      }
    };
    
    fetchWeeksForForm();
  }, [formData.course]);

  // Fetch lessons when week changes
  useEffect(() => {
    const fetchLessonsForWeek = async () => {
      if (formData.week && formData.week !== "no-lesson" && formData.week !== "no-week") {
        await fetchLessons(formData.week);
      } else {
        setAvailableLessons([]);
      }
    };
    
    fetchLessonsForWeek();
  }, [formData.week]);

  // Fetch livestreams when filters change
  useEffect(() => {
    if (selectedCourse === "all-courses") {
      fetchAllLivestreams();
    } else if (selectedCourse) {
      fetchLivestreams();
    }
  }, [selectedCourse, statusFilter]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (isDialogOpen && !isEditing) {
      initializeForm();
    }
  }, [isDialogOpen, isEditing]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses({
        status: 'approved',
        published: true 
      });
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const fetchWeeks = async (courseId) => {
    setIsLoadingWeeks(true);
    try {
      const response = await weekAPI.getWeeksByCourse(courseId);
      setAvailableWeeks(response.data || []);
    } catch (error) {
      console.error('Error fetching weeks:', error);
      setAvailableWeeks([]);
      toast.error('Failed to load weeks');
    } finally {
      setIsLoadingWeeks(false);
    }
  };

  const fetchLessons = async (weekId) => {
    setIsLoadingLessons(true);
    try {
      const response = await lessonAPI.getLessonsByWeek(weekId);
      setAvailableLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setAvailableLessons([]);
      toast.error('Failed to load lessons');
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const fetchLivestreams = async () => {
    if (!selectedCourse || selectedCourse === "all-courses") return;
    
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await livestreamAPI.getLivestreamsByCourse(selectedCourse, params);
      const streams = response.data || [];
      setLivestreams(streams);
      
      // Calculate stats
      const calculatedStats = calculateStats(streams);
      setStats(calculatedStats);
      
      // Separate upcoming and ongoing streams
      const now = new Date();
      const upcoming = streams.filter(stream => 
        stream.status === 'scheduled' && new Date(stream.scheduledStartTime) > now
      );
      const ongoing = streams.filter(stream => 
        stream.status === 'live'
      );
      
      setUpcomingStreams(upcoming);
      setOngoingStreams(ongoing);
    } catch (error) {
      console.error('Error fetching livestreams:', error);
      toast.error(error.message || 'Failed to load livestreams');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllLivestreams = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await livestreamAPI.getAllLivestreams(params);
      const streams = response.data || [];
      setLivestreams(streams);
      
      // Calculate stats
      const calculatedStats = calculateStats(streams);
      setStats(calculatedStats);
      
      // Separate upcoming and ongoing streams
      const now = new Date();
      const upcoming = streams.filter(stream => 
        stream.status === 'scheduled' && new Date(stream.scheduledStartTime) > now
      );
      const ongoing = streams.filter(stream => 
        stream.status === 'live'
      );
      
      setUpcomingStreams(upcoming);
      setOngoingStreams(ongoing);
    } catch (error) {
      console.error('Error fetching all livestreams:', error);
      toast.error(error.message || 'Failed to load livestreams');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCourseData = selectedCourse !== "all-courses" 
    ? courses.find(c => c._id === selectedCourse)
    : null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course: "",
      week: "no-week",
      lesson: "no-lesson",
      scheduledStartTime: "",
      scheduledEndTime: "",
      meetingType: "google_meet",
      meetingUrl: "",
      meetingId: "",
      meetingPassword: "",
      meetingInstructions: "",
      isPublic: false,
    });
    setAvailableWeeks([]);
    setAvailableLessons([]);
    setIsEditing(false);
    setEditingStream(null);
  };

  const openCreateDialog = () => {
    if (selectedCourse === "all-courses" && courses.length > 0) {
      toast.error("Please select a specific course first");
      return;
    }
    
    if (!selectedCourse && courses.length > 0) {
      toast.error("Please select a course first");
      return;
    }
    
    resetForm();
    initializeForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (stream) => {
    setFormData({
      title: stream.title,
      description: stream.description || "",
      course: stream.course?._id || stream.course || "",
      week: stream.week?._id || stream.week || "no-week",
      lesson: stream.lesson?._id || stream.lesson || "no-lesson",
      scheduledStartTime: stream.scheduledStartTime ? 
        format(parseISO(stream.scheduledStartTime), "yyyy-MM-dd'T'HH:mm") : "",
      scheduledEndTime: stream.scheduledEndTime ? 
        format(parseISO(stream.scheduledEndTime), "yyyy-MM-dd'T'HH:mm") : "",
      meetingType: stream.meetingType || "google_meet",
      meetingUrl: stream.meetingUrl || "",
      meetingId: stream.meetingId || "",
      meetingPassword: stream.meetingPassword || "",
      meetingInstructions: stream.meetingInstructions || "",
      isPublic: stream.isPublic || false,
    });
    setEditingStream(stream);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Livestream title is required");
      return;
    }

    if (!formData.course) {
      toast.error("Please select a course");
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

    const startTime = new Date(formData.scheduledStartTime);
    if (startTime < new Date()) {
      toast.error("Scheduled start time must be in the future");
      return;
    }

    try {
      setIsCreating(true);
      
      // Prepare data, converting "no-week" and "no-lesson" to null
      const streamData = {
        title: formData.title,
        description: formData.description,
        course: formData.course,
        week: formData.week === "no-week" ? null : formData.week,
        lesson: formData.lesson === "no-lesson" ? null : formData.lesson,
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

      if (isEditing && editingStream) {
        await livestreamAPI.updateLivestream(editingStream.streamSlug, streamData);
        toast.success("Livestream updated successfully!");
      } else {
        await livestreamAPI.createLivestream(streamData);
        toast.success("Livestream created successfully!");
      }

      setIsDialogOpen(false);
      resetForm();
      if (selectedCourse === "all-courses") {
        fetchAllLivestreams();
      } else {
        fetchLivestreams();
      }
    } catch (error) {
      console.error('Error saving livestream:', error);
      toast.error(error.message || 'Failed to save livestream');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (stream) => {
    showAlert({
      title: "Cancel Livestream",
      description: `Are you sure you want to cancel "${stream.title}"? This will end the stream for all participants.`,
      confirmText: "Cancel Livestream",
      cancelText: "Keep Active",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await livestreamAPI.deleteLivestream(stream.streamSlug);
          toast.success("Livestream cancelled successfully!");
          if (selectedCourse === "all-courses") {
            fetchAllLivestreams();
          } else {
            fetchLivestreams();
          }
        } catch (error) {
          console.error('Error cancelling livestream:', error);
          toast.error(error.message || 'Failed to cancel livestream');
        }
      },
    });
  };

  const handleStartStream = async (stream) => {
    try {
      await livestreamAPI.startLivestream(stream.streamSlug);
      toast.success("Livestream started successfully!");
      
      // Refresh data
      if (selectedCourse === "all-courses") {
        fetchAllLivestreams();
      } else {
        fetchLivestreams();
      }
    } catch (error) {
      console.error('Error starting livestream:', error);
      toast.error(error.message || 'Failed to start livestream');
    }
  };

  const handleEndStream = async (stream) => {
    showAlert({
      title: "End Livestream",
      description: `Are you sure you want to end "${stream.title}"?`,
      confirmText: "End Livestream",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await livestreamAPI.endLivestream(stream.streamSlug);
          toast.success("Livestream ended successfully!");
          if (selectedCourse === "all-courses") {
            fetchAllLivestreams();
          } else {
            fetchLivestreams();
          }
        } catch (error) {
          console.error('Error ending livestream:', error);
          toast.error(error.message || 'Failed to end livestream');
        }
      },
    });
  };

  const handleJoinStream = async (stream) => {
    try {
      const response = await livestreamAPI.joinLivestream(stream.streamSlug);
      const { meetingInfo } = response.data || {};
      
      if (meetingInfo) {
        setMeetingInfo({
          ...meetingInfo,
          stream
        });
      } else {
        toast.error("Failed to get meeting information");
      }
    } catch (error) {
      console.error('Error joining livestream:', error);
      toast.error(error.message || 'Failed to join livestream');
    }
  };

  const handleCopyJoinLink = async (stream) => {
    try {
      const joinUrl = `${window.location.origin}/livestreams/${stream.streamSlug}`;
      await navigator.clipboard.writeText(joinUrl);
      toast.success("Join link copied to clipboard!");
    } catch (error) {
      console.error('Error copying join link:', error);
      toast.error("Failed to copy join link");
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

  const handleSendReminder = async (stream) => {
    try {
      toast.info("Reminder feature coming soon!");
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error(error.message || 'Failed to send reminder');
    }
  };

  const toggleStreamExpansion = (streamId) => {
    setExpandedStream(expandedStream === streamId ? null : streamId);
  };

  const getStatusBadge = (stream) => {
    switch (stream.status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case 'live':
        return (
          <Badge className="bg-green-500 animate-pulse">
            <PlayCircle className="h-3 w-3 mr-1" />
            Live Now
          </Badge>
        );
      case 'ended':
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTimeStatus = (stream) => {
    const now = new Date();
    const startTime = new Date(stream.scheduledStartTime);
    
    if (stream.status === 'live') {
      return "Live Now";
    }
    
    if (stream.status === 'scheduled') {
      if (startTime < now) {
        return "Starting soon";
      }
      return formatDistanceToNow(startTime, { addSuffix: true });
    }
    
    return format(startTime, 'PPpp');
  };

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy • hh:mm a');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getMeetingPlatformInfo = (stream) => {
    switch(stream.meetingType) {
      case 'zoom':
        return {
          name: 'Zoom',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968865.png',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'google_meet':
        return {
          name: 'Google Meet',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'microsoft_teams':
        return {
          name: 'Microsoft Teams',
          icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968885.png',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          name: 'Custom Meeting',
          icon: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const filteredStreams = livestreams.filter(stream =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (stream.description && stream.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Livestreams</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage external meeting livestreams for courses</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => selectedCourse === "all-courses" ? fetchAllLivestreams() : fetchLivestreams()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} disabled={selectedCourse === "all-courses" || !selectedCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Livestream
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Livestream" : "Create New Livestream"}</DialogTitle>
                  <DialogDescription>
                    Schedule a new external meeting livestream for {selectedCourseData?.courseTitle || 'selected course'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Stream Title *</Label>
                      <Input
                        name="title"
                        placeholder="e.g., Introduction to JavaScript - Live Session"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        name="description"
                        placeholder="What will this livestream cover? Topics, agenda, etc."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Course *</Label>
                        <Select
                          value={formData.course}
                          onValueChange={(value) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              course: value, 
                              week: "no-week", 
                              lesson: "no-lesson" 
                            }));
                            setAvailableWeeks([]);
                            setAvailableLessons([]);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course._id} value={course._id}>
                                {course.courseTitle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Week (Optional)</Label>
                        <Select
                          value={formData.week}
                          onValueChange={(value) => {
                            setFormData(prev => ({ 
                              ...prev, 
                              week: value, 
                              lesson: "no-lesson" 
                            }));
                            setAvailableLessons([]);
                          }}
                          disabled={!formData.course || isLoadingWeeks}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingWeeks ? "Loading weeks..." : "Select week"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-week">
                              {availableWeeks.length === 0 && formData.course && !isLoadingWeeks
                                ? "No weeks available"
                                : "None"}
                            </SelectItem>
                            {availableWeeks.map((week) => (
                              <SelectItem key={week._id} value={week._id}>
                                Week {week.weekNumber}: {week.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isLoadingWeeks && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading weeks...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Lesson (Optional)</Label>
                        <Select
                          value={formData.lesson}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, lesson: value }))}
                          disabled={!formData.week || formData.week === "no-week" || isLoadingLessons}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingLessons ? "Loading lessons..." : "Select lesson"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-lesson">
                              {availableLessons.length === 0 && formData.week && formData.week !== "no-week" && !isLoadingLessons
                                ? "No lessons available"
                                : "None"}
                            </SelectItem>
                            {availableLessons.map((lesson) => (
                              <SelectItem key={lesson._id} value={lesson._id}>
                                {lesson.lessonTitle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isLoadingLessons && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading lessons...
                          </div>
                        )}
                      </div>

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
                    </div>

                    <div className="space-y-2">
                      <Label>Meeting URL *</Label>
                      <Input
                        name="meetingUrl"
                        placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
                        value={formData.meetingUrl}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste the full meeting link. Students will be redirected to this URL.
                      </p>
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Scheduled End Time (Optional)</Label>
                        <Input
                          name="scheduledEndTime"
                          type="datetime-local"
                          value={formData.scheduledEndTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Stream Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="isPublic">Public Stream</Label>
                          <p className="text-sm text-muted-foreground">
                            Anyone with the link can join (not just enrolled students)
                          </p>
                        </div>
                        <Switch
                          id="isPublic"
                          checked={formData.isPublic}
                          onCheckedChange={(checked) =>
                            setFormData(prev => ({ ...prev, isPublic: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isEditing ? "Update" : "Create"} Livestream
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Streams</p>
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
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
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

        {/* Filters and Course Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course to manage livestreams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-courses">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.courseTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search livestreams..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Livestreams</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live Now</SelectItem>
                  <SelectItem value="ended">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedCourseData && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">{selectedCourseData.courseTitle}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedCourseData.learners?.length || 0} enrolled students
                    </div>
                  </div>
                  <Badge variant="outline">
                    {livestreams.length} stream{livestreams.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Ongoing Streams */}
        {ongoingStreams.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <PlayCircle className="h-5 w-5" />
                Live Now ({ongoingStreams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ongoingStreams.map((stream) => {
                  const platform = getMeetingPlatformInfo(stream);
                  return (
                    <Card key={stream._id} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold">{stream.title}</h4>
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
                              <Users className="h-3 w-3" />
                              <span>{stream.participants?.filter(p => !p.leftAt).length || 0} participants</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Eye className="h-3 w-3" />
                              <span>{stream.totalViews || 0} total views</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleJoinStream(stream)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Join Meeting
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEndStream(stream)}
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

        {/* Main Livestreams Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Livestreams</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredStreams.length} of {livestreams.length}
                  </span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStreams.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No livestreams found</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCourse !== "all-courses"
                    ? `No livestreams found for "${selectedCourseData?.courseTitle}"`
                    : "No livestreams found. Select a course or create one."}
                </p>
                {courses.length > 0 && (
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Livestream
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Livestream</TableHead>
                      <TableHead className="w-[200px]">Schedule</TableHead>
                      <TableHead className="w-[100px]">Access</TableHead>
                      <TableHead className="w-[120px]">Participants</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[200px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStreams.map((stream) => {
                      const platform = getMeetingPlatformInfo(stream);
                      return (
                        <React.Fragment key={stream._id}>
                          <TableRow className="hover:bg-muted/50">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleStreamExpansion(stream._id)}
                              >
                                {expandedStream === stream._id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{stream.title}</div>
                                {stream.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {stream.description}
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
                                  {formatDateTime(stream.scheduledStartTime)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getTimeStatus(stream)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {stream.isPublic ? (
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
                                <span>{stream.participants?.filter(p => !p.leftAt).length || 0}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({stream.totalViews || 0} views)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(stream)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                {stream.status === 'scheduled' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleStartStream(stream)}
                                      title="Start Stream"
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleSendReminder(stream)}
                                      title="Send Reminder"
                                    >
                                      <Bell className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}

                                {(stream.status === 'scheduled' || stream.status === 'live') && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleJoinStream(stream)}
                                      title="Join Meeting"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleCopyMeetingLink(stream.meetingUrl)}
                                      title="Copy Meeting Link"
                                    >
                                      <Link className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}

                                {stream.status === 'live' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEndStream(stream)}
                                    title="End Stream"
                                  >
                                    <StopCircle className="h-4 w-4" />
                                  </Button>
                                )}

                                {stream.status === 'scheduled' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditDialog(stream)}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}

                                {stream.status === 'scheduled' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(stream)}
                                    title="Cancel"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}

                                {stream.status === 'ended' && stream.recordingUrl && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => window.open(stream.recordingUrl, '_blank')}
                                    title="View Recording"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Livestream Details Row */}
                          {expandedStream === stream._id && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={7} className="p-0">
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Stream Details</h4>
                                        <div className="space-y-3">
                                          <div>
                                            <span className="text-sm text-muted-foreground">Description:</span>
                                            <div className="text-sm mt-1">
                                              {stream.description || 'No description provided'}
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <span className="text-sm text-muted-foreground">Course:</span>
                                            <div className="text-sm">
                                              {stream.course?.courseTitle || 'Unknown Course'}
                                            </div>
                                          </div>
                                          
                                          {stream.week && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Week:</span>
                                              <div className="text-sm">
                                                Week {stream.week?.weekNumber}: {stream.week?.title}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {stream.lesson && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Lesson:</span>
                                              <div className="text-sm">
                                                {stream.lesson?.lessonTitle}
                                              </div>
                                            </div>
                                          )}
                                          
                                          <div>
                                            <span className="text-sm text-muted-foreground">Created By:</span>
                                            <div className="text-sm">
                                              {stream.createdBy?.firstname} {stream.createdBy?.lastname}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Stream Statistics</h4>
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Total Views:</span>
                                            <span className="font-medium">{stream.totalViews || 0}</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Peak Viewers:</span>
                                            <span className="font-medium">{stream.peakViewers || 0}</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Active Participants:</span>
                                            <span className="font-medium">
                                              {stream.participants?.filter(p => !p.leftAt).length || 0}
                                            </span>
                                          </div>
                                          {stream.actualStartTime && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm">Actual Duration:</span>
                                              <span className="font-medium">
                                                {stream.actualStartTime && stream.actualEndTime 
                                                  ? `${Math.round((new Date(stream.actualEndTime) - new Date(stream.actualStartTime)) / 60000)} mins`
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
                                                  href={stream.meetingUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-primary hover:underline flex items-center gap-1 break-all"
                                                >
                                                  {stream.meetingUrl}
                                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                </a>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => handleCopyMeetingLink(stream.meetingUrl)}
                                                  title="Copy meeting link"
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {stream.meetingId && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Meeting ID:</span>
                                              <div className="text-sm font-mono bg-muted p-2 rounded mt-1">
                                                {stream.meetingId}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {stream.meetingPassword && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Meeting Password:</span>
                                              <div className="text-sm font-mono bg-muted p-2 rounded mt-1">
                                                {stream.meetingPassword}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {stream.meetingInstructions && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Instructions:</span>
                                              <div className="text-sm mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                {stream.meetingInstructions}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {stream.recordingUrl && (
                                            <div>
                                              <span className="text-sm text-muted-foreground">Recording:</span>
                                              <div className="text-sm">
                                                <a 
                                                  href={stream.recordingUrl}
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
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Lecturers</h4>
                                        <div className="space-y-2">
                                          {stream.lecturers?.map((lecturer, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                              <Avatar className="h-6 w-6">
                                                <AvatarImage src={lecturer.user?.userImage} />
                                                <AvatarFallback>
                                                  {lecturer.user?.firstname?.[0]}{lecturer.user?.lastname?.[0]}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="text-sm">
                                                {lecturer.user?.firstname} {lecturer.user?.lastname}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                                    {stream.status === 'scheduled' && (
                                      <>
                                        <Button
                                          onClick={() => handleStartStream(stream)}
                                        >
                                          <Play className="h-4 w-4 mr-2" />
                                          Start Stream
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleSendReminder(stream)}
                                        >
                                          <Bell className="h-4 w-4 mr-2" />
                                          Send Reminder
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleJoinStream(stream)}
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Preview Meeting
                                        </Button>
                                      </>
                                    )}

                                    {stream.status === 'live' && (
                                      <>
                                        <Button
                                          onClick={() => handleJoinStream(stream)}
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Join Meeting
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleEndStream(stream)}
                                        >
                                          <StopCircle className="h-4 w-4 mr-2" />
                                          End Stream
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => handleCopyMeetingLink(stream.meetingUrl)}
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copy Meeting Link
                                        </Button>
                                      </>
                                    )}

                                    {stream.status === 'ended' && stream.recordingUrl && (
                                      <Button
                                        variant="outline"
                                        onClick={() => window.open(stream.recordingUrl, '_blank')}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Recording
                                      </Button>
                                    )}

                                    {stream.status === 'scheduled' && (
                                      <Button
                                        variant="outline"
                                        onClick={() => openEditDialog(stream)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </Button>
                                    )}

                                    {stream.status === 'scheduled' && (
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(stream)}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Stream
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
                  {meetingInfo.stream?.title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <img src={meetingInfo.icon} alt={meetingInfo.platform} className="h-8 w-8" />
                  <div>
                    <div className="font-medium">{meetingInfo.platform}</div>
                    <div className="text-sm text-muted-foreground">
                      {meetingInfo.stream?.course?.courseTitle}
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
                
                <div className="space-y-2">
                  <Label>You're joining as</Label>
                  <div className="text-sm">
                    {meetingInfo.user?.name} ({meetingInfo.user?.email})
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
    </AdminDashboardLayout>
  );
}

export default function LivestreamsPage() {
  return (
    <Suspense
      fallback={
        <AdminDashboardLayout>
          <div className="container mx-auto px-4 py-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </AdminDashboardLayout>
      }
    >
      <LivestreamsContent />
    </Suspense>
  );
}