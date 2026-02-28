"use client";

import { useState, useEffect } from "react";
import React from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Calendar,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  Clock,
  Link,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";

export default function LessonsPage() {
  const { showAlert } = useAlertDialog();
  
  const [courses, setCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLesson, setExpandedLesson] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  const [formData, setFormData] = useState({
    lessonTitle: "",
    lessonContent: "",
    shortDescription: "",
    order: "",
    duration: "",
    videoUrl: "",
    isActive: true,
  });

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch weeks when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchWeeks();
      setSelectedWeek(""); // Reset week selection
    }
  }, [selectedCourse]);

  // Fetch lessons when week changes
  useEffect(() => {
    if (selectedWeek) {
      fetchLessons();
    } else {
      setLessons([]);
    }
  }, [selectedWeek]);

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

  const fetchWeeks = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await weekAPI.getWeeksByCourse(selectedCourse);
      setWeeks(response.data || []);
    } catch (error) {
      console.error('Error fetching weeks:', error);
      toast.error('Failed to load weeks');
    }
  };

  const fetchLessons = async () => {
    if (!selectedWeek) return;
    
    setIsLoading(true);
    try {
      const response = await lessonAPI.getLessonsByWeek(selectedWeek);
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCourseData = courses.find(c => c._id === selectedCourse);
  const selectedWeekData = weeks.find(w => w._id === selectedWeek);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    resetForm();
    if (selectedWeekData) {
      const nextOrder = lessons.length > 0 
        ? Math.max(...lessons.map(l => l.order)) + 1 
        : 1;
      setFormData(prev => ({
        ...prev,
        order: nextOrder.toString()
      }));
    }
    setIsDialogOpen(true);
  };

  const openEditDialog = (lesson) => {
    setFormData({
      lessonTitle: lesson.lessonTitle,
      lessonContent: lesson.lessonContent,
      shortDescription: lesson.shortDescription || "",
      order: lesson.order.toString(),
      duration: lesson.duration?.toString() || "",
      videoUrl: lesson.videoUrl || "",
      isActive: lesson.isActive,
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
        await lessonAPI.updateLesson(editingLesson._id, lessonData);
        toast.success("Lesson updated!");
      } else {
        await lessonAPI.createLesson(lessonData);
        toast.success("Lesson created!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(error.message || 'Failed to save lesson');
    }
  };

  const handleDelete = (lesson) => {
    showAlert({
      title: "Delete Lesson",
      description: `Are you sure you want to delete "${lesson.lessonTitle}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await lessonAPI.deleteLesson(lesson._id);
          toast.success("Lesson deleted!");
          fetchLessons();
        } catch (error) {
          console.error('Error deleting lesson:', error);
          toast.error(error.message || 'Failed to delete lesson');
        }
      },
    });
  };

  const handleReorder = async (lesson, direction) => {
    try {
      await lessonAPI.reorderLesson(lesson._id, direction);
      toast.success(`Lesson moved ${direction}`);
      fetchLessons();
    } catch (error) {
      console.error('Error reordering lesson:', error);
      toast.error(error.message || 'Failed to reorder lesson');
    }
  };

  const toggleLessonExpansion = (lessonId) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
    } else {
      setExpandedLesson(lessonId);
    }
  };

  const getStatusBadge = (lesson) => {
    if (lesson.isActive) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }
  };

  const filteredLessons = lessons
    .filter(lesson =>
      lesson.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.shortDescription && lesson.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => a.order - b.order);

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Lessons</h1>
            <p className="text-muted-foreground mt-1">Manage course lessons</p>
          </div>
        </div>

        {/* Course Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
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
                <Label>Week</Label>
                <Select
                  value={selectedWeek}
                  onValueChange={setSelectedWeek}
                  disabled={!selectedCourse}
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
              </div>
            </div>

            {selectedCourseData && selectedWeekData && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{selectedCourseData.courseTitle}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Week {selectedWeekData.weekNumber}: {selectedWeekData.title}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
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
                  />
                </div>
                
                {selectedWeek && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Lesson
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
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
                            rows={8}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={formData.isActive ? "active" : "inactive"}
                            onValueChange={(value) => 
                              setFormData(prev => ({ ...prev, isActive: value === "active" }))
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
                        <Button onClick={handleSubmit}>
                          {isEditing ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
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
            ) : isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
                <p className="text-muted-foreground mb-4">
                  This week has no lessons yet.
                </p>
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
                                <ChevronDownIcon className="h-4 w-4" />
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
                              <div className="font-medium">{lesson.lessonTitle}</div>
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
                          <TableCell>
                            {getStatusBadge(lesson)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(lesson.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <div className="flex flex-col gap-1 mr-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleReorder(lesson, 'up')}
                                  disabled={lesson.order === 1}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleReorder(lesson, 'down')}
                                  disabled={lesson.order === lessons.length}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
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
                              <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2">Lesson Content</h4>
                                    <div className="p-3 bg-white rounded-md border max-h-[200px] overflow-y-auto">
                                      <p className="whitespace-pre-line text-sm">
                                        {lesson.lessonContent}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Details</h4>
                                    <div className="space-y-3">
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
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status:</span>
                                        {getStatusBadge(lesson)}
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                                        <span className="text-sm">
                                          {new Date(lesson.updatedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      
                                      <div className="pt-3">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full"
                                          onClick={() => window.open(`/admin/lessons/${lesson._id}/preview`, '_blank')}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Preview Lesson
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
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
      </div>
    </AdminDashboardLayout>
  );
}