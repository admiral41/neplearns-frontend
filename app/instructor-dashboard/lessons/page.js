"use client";

import { useState, useEffect } from "react";
import React from "react";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  PlayCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Link,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
import LessonResources from "@/components/instructor/LessonResources";

export default function InstructorLessonsPage() {
  const { showAlert } = useAlertDialog();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [courses, setCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [formData, setFormData] = useState({
    lessonTitle: "",
    lessonContent: "",
    shortDescription: "",
    order: "",
    duration: "",
    videoUrl: "",
    isActive: true,
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
  useEffect(() => {
    const fetchWeeks = async () => {
      if (!selectedCourse) {
        setWeeks([]);
        setSelectedWeek("");
        return;
      }

      try {
        setIsLoadingWeeks(true);
        const response = await weekAPI.getWeeksByCourse(selectedCourse);
        setWeeks(response.data || []);
      } catch (error) {
        console.error('Error fetching weeks:', error);
        toast.error('Failed to load weeks');
        setWeeks([]);
      } finally {
        setIsLoadingWeeks(false);
      }
    };

    fetchWeeks();
  }, [selectedCourse]);

  // Fetch lessons when week is selected
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedWeek) {
        setLessons([]);
        return;
      }

      try {
        setIsLoadingLessons(true);
        const response = await lessonAPI.getLessonsByWeek(selectedWeek);
        setLessons(response.data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Failed to load lessons');
        setLessons([]);
      } finally {
        setIsLoadingLessons(false);
      }
    };

    fetchLessons();
  }, [selectedWeek]);

  // Reset week selection when course changes
  useEffect(() => {
    setSelectedWeek("");
    setLessons([]);
  }, [selectedCourse]);

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);
  const selectedWeekData = weeks.find((w) => w._id === selectedWeek);
  const isCourseApproved = selectedCourseData ?
    (selectedCourseData.status === 'approved' || selectedCourseData.status === 'published') : false;
  const isCoursePublished = selectedCourseData ? selectedCourseData.published : false;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      lessonTitle: "",
      lessonContent: "",
      shortDescription: "",
      order: "",
      duration: "",
      videoUrl: "",
      isActive: true,
    });
    setIsEditing(false);
    setEditingLesson(null);
  };

  const openCreateDialog = () => {
    if (!selectedWeek) {
      toast.error("Please select a week first");
      return;
    }

    if (!isCourseApproved) {
      toast.error("You can only create lessons for approved courses");
      return;
    }

    resetForm();
    const nextOrder = lessons.length > 0
      ? Math.max(...lessons.map((l) => l.order || 0)) + 1
      : 1;
    setFormData((prev) => ({
      ...prev,
      order: nextOrder.toString(),
    }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (lesson) => {
    if (!isCourseApproved) {
      toast.error("You can only edit lessons for approved courses");
      return;
    }

    setFormData({
      lessonTitle: lesson.lessonTitle || lesson.title || "",
      lessonContent: lesson.lessonContent || lesson.content || "",
      shortDescription: lesson.shortDescription || "",
      order: lesson.order?.toString() || "",
      duration: lesson.duration?.toString() || "",
      videoUrl: lesson.videoUrl || "",
      isActive: lesson.isActive !== false,
    });
    setEditingLesson(lesson);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.lessonTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    if (!formData.lessonContent.trim()) {
      toast.error("Lesson content is required");
      return;
    }
    if (!formData.order || isNaN(formData.order) || parseInt(formData.order) <= 0) {
      toast.error("Valid order number is required");
      return;
    }
    if (!selectedWeek) {
      toast.error("Please select a week");
      return;
    }
    if (!isCourseApproved) {
      toast.error("You can only create lessons for approved courses");
      return;
    }

    try {
      const lessonData = {
        week: selectedWeek,
        lessonTitle: formData.lessonTitle.trim(),
        lessonContent: formData.lessonContent.trim(),
        shortDescription: formData.shortDescription.trim(),
        order: parseInt(formData.order),
        duration: formData.duration ? parseInt(formData.duration) : 0,
        videoUrl: formData.videoUrl.trim(),
        isActive: formData.isActive,
      };

      if (isEditing && editingLesson) {
        const response = await lessonAPI.updateLesson(editingLesson._id, lessonData);
        if (response.success) {
          toast.success("Lesson updated successfully!");

          // Update local state
          setLessons(prev => prev.map(l =>
            l._id === editingLesson._id ? { ...l, ...lessonData } : l
          ));

          setIsDialogOpen(false);
          resetForm();
        } else {
          toast.error(response.msg || "Failed to update lesson");
        }
      } else {
        const response = await lessonAPI.createLesson(lessonData);
        if (response.success) {
          toast.success("Lesson created successfully!");

          // Add to local state
          setLessons(prev => [...prev, response.data]);

          setIsDialogOpen(false);
          resetForm();
        } else {
          toast.error(response.msg || "Failed to create lesson");
        }
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(error.message || "Failed to save lesson");
    }
  };

  const handleDelete = (lesson) => {
    if (!isCourseApproved) {
      toast.error("You can only delete lessons for approved courses");
      return;
    }

    showAlert({
      title: "Delete Lesson",
      description: `Are you sure you want to delete "${lesson.lessonTitle || lesson.title}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await lessonAPI.deleteLesson(lesson._id);
          if (response.success) {
            toast.success("Lesson deleted successfully!");

            // Remove from local state
            setLessons(prev => prev.filter(l => l._id !== lesson._id));
          } else {
            toast.error(response.msg || "Failed to delete lesson");
          }
        } catch (error) {
          console.error('Error deleting lesson:', error);
          toast.error(error.message || "Failed to delete lesson");
        }
      },
    });
  };

  const toggleLessonExpansion = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
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

  const getLessonStatusBadge = (lesson) => {
    if (lesson.isActive !== false) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const filteredLessons = lessons
    .filter((lesson) => {
      const title = lesson.lessonTitle || lesson.title || "";
      const desc = lesson.shortDescription || "";
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Course Lessons</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage lessons for your approved courses
          </p>
        </div>

        {/* Course & Week Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {isLoadingWeeks && selectedCourse ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedWeek}
                    onValueChange={setSelectedWeek}
                    disabled={!selectedCourse || !isCourseApproved}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map((week) => (
                        <SelectItem key={week._id} value={week._id}>
                          Week {week.weekNumber}: {week.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                          {selectedWeekData && (
                            <Badge variant="outline">
                              Week {selectedWeekData.weekNumber}
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

                  {selectedWeekData && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{selectedWeekData.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
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
                          You can only create lessons after your course is approved by the admin team.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Published Status Message */}
                {isCoursePublished && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Course Published
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          This course is live and visible to students. Any changes to lessons will affect enrolled students.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lessons Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lessons..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!selectedWeek || !isCourseApproved}
                  />
                </div>

                <Button
                  onClick={openCreateDialog}
                  disabled={!selectedWeek || !isCourseApproved}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Lesson
                </Button>
              </div>
            </div>

            {!selectedWeek ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Week</h3>
                <p className="text-muted-foreground">
                  Please select a course and week to view lessons
                </p>
              </div>
            ) : !isCourseApproved ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Course Not Approved</h3>
                <p className="text-muted-foreground">
                  You can only manage lessons for approved courses.
                </p>
              </div>
            ) : isLoadingLessons ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
                <p className="text-muted-foreground mb-4">This week has no lessons yet.</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Lesson
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[80px]">Order</TableHead>
                      <TableHead>Lesson</TableHead>
                      <TableHead className="w-[120px]">Duration</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Created</TableHead>
                      <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLessons.map((lesson) => (
                      <React.Fragment key={lesson._id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleLessonExpansion(lesson._id)}
                            >
                              {expandedLesson === lesson._id ? (
                                <ChevronRight className="h-4 w-4 rotate-90" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {lesson.order}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {lesson.lessonTitle || lesson.title}
                              </div>
                              {lesson.shortDescription && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {lesson.shortDescription}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lesson.duration > 0 ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration} min</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getLessonStatusBadge(lesson)}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {lesson.createdAt
                                ? new Date(lesson.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                                : "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(lesson)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(lesson)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Lesson Details Row */}
                        {expandedLesson === lesson._id && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-medium mb-2">Lesson Content</h4>
                                    <div className="p-3 bg-white rounded-md border max-h-[200px] overflow-y-auto">
                                      <p className="whitespace-pre-line text-sm">
                                        {lesson.lessonContent || lesson.content || "No content"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">Video:</span>
                                      {lesson.videoUrl ? (
                                        <Badge variant="outline" className="text-xs">
                                          <Link className="h-3 w-3 mr-1" />
                                          Has video
                                        </Badge>
                                      ) : (
                                        <span className="text-sm">No video</span>
                                      )}
                                    </div>
                                  </div>

                                  <LessonResources lessonId={lesson._id} />
                                </div>
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

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedCourseData && selectedWeekData && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Course: {selectedCourseData.courseTitle}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Week {selectedWeekData.weekNumber}: {selectedWeekData.title}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lesson Title *</Label>
                  <Input
                    name="lessonTitle"
                    placeholder="e.g., Introduction to HTML"
                    value={formData.lessonTitle}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order *</Label>
                  <Input
                    name="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  name="shortDescription"
                  placeholder="Brief overview of what this lesson covers..."
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    name="duration"
                    type="number"
                    min="0"
                    placeholder="30"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    name="videoUrl"
                    placeholder="https://youtube.com/embed/..."
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lesson Content *</Label>
                <Textarea
                  name="lessonContent"
                  placeholder="Detailed lesson content..."
                  value={formData.lessonContent}
                  onChange={handleInputChange}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, isActive: value === "active" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isCourseApproved}
              >
                {isEditing ? "Update Lesson" : "Create Lesson"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </InstructorDashboardLayout>
  );
}