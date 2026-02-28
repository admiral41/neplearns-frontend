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
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronRight,
  FileText,
  AlertTriangle,
  Lock,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { useCourseWeeks, useCreateWeek, useUpdateWeek, useDeleteWeek } from "@/lib/hooks/useInstructor";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";

export default function InstructorWeeksPage() {
  const { showAlert } = useAlertDialog();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWeek, setEditingWeek] = useState(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    weekNumber: "",
    description: "",
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

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);
  const isCourseApproved = selectedCourseData ? 
    (selectedCourseData.status === 'approved' || selectedCourseData.status === 'published') : false;
  const isCoursePublished = selectedCourseData ? selectedCourseData.published : false;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      weekNumber: "",
      description: "",
      isActive: true,
    });
    setIsEditing(false);
    setEditingWeek(null);
  };

  const openCreateDialog = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    if (!isCourseApproved) {
      toast.error("You can only create weeks for approved courses");
      return;
    }

    resetForm();
    const nextWeekNumber = weeks.length > 0
      ? Math.max(...weeks.map((w) => w.weekNumber || 0)) + 1
      : 1;
    setFormData((prev) => ({
      ...prev,
      weekNumber: nextWeekNumber.toString(),
    }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (week) => {
    if (!isCourseApproved) {
      toast.error("You can only edit weeks for approved courses");
      return;
    }

    setFormData({
      title: week.title,
      weekNumber: week.weekNumber?.toString() || "",
      description: week.description || "",
      isActive: week.isActive,
    });
    setEditingWeek(week);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Week title is required");
      return;
    }
    if (!formData.weekNumber || isNaN(formData.weekNumber) || parseInt(formData.weekNumber) <= 0) {
      toast.error("Valid week number is required");
      return;
    }
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    if (!isCourseApproved) {
      toast.error("You can only create weeks for approved courses");
      return;
    }

    try {
      const weekData = {
        course: selectedCourse,
        title: formData.title.trim(),
        weekNumber: parseInt(formData.weekNumber),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      if (isEditing && editingWeek) {
        const response = await weekAPI.updateWeek(editingWeek._id, weekData);
        if (response.success) {
          toast.success("Week updated successfully!");
          
          // Update local state
          setWeeks(prev => prev.map(w => 
            w._id === editingWeek._id ? { ...w, ...weekData } : w
          ));
          
          setIsDialogOpen(false);
          resetForm();
        } else {
          toast.error(response.msg || "Failed to update week");
        }
      } else {
        const response = await weekAPI.createWeek(weekData);
        if (response.success) {
          toast.success("Week created successfully!");
          
          // Add to local state
          setWeeks(prev => [...prev, response.data]);
          
          setIsDialogOpen(false);
          resetForm();
        } else {
          toast.error(response.msg || "Failed to create week");
        }
      }
    } catch (error) {
      console.error('Error saving week:', error);
      toast.error(error.message || "Failed to save week");
    }
  };

  const handleDelete = (week) => {
    if (!isCourseApproved) {
      toast.error("You can only delete weeks for approved courses");
      return;
    }

    showAlert({
      title: "Delete Week",
      description: `Are you sure you want to delete "${week.title}"? This will also delete all lessons in this week.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await weekAPI.deleteWeek(week._id);
          if (response.success) {
            toast.success("Week deleted successfully!");
            
            // Remove from local state
            setWeeks(prev => prev.filter(w => w._id !== week._id));
          } else {
            toast.error(response.msg || "Failed to delete week");
          }
        } catch (error) {
          console.error('Error deleting week:', error);
          toast.error(error.message || "Failed to delete week");
        }
      },
    });
  };

  const toggleWeekExpansion = (weekId) => {
    setExpandedWeek(expandedWeek === weekId ? null : weekId);
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

  const getWeekStatusBadge = (week) => {
    if (week.isActive) {
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

  const filteredWeeks = weeks
    .filter(
      (week) =>
        week.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (week.description && week.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0));

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Course Weeks</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage weeks for your approved courses
          </p>
        </div>

        {/* Course Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Course</Label>
                {isLoadingCourses ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
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
                <div className="p-4 bg-muted/30 rounded-lg border">
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
                            <Badge variant="outline">
                              {weeks.length} week{weeks.length !== 1 ? "s" : ""}
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
                            You can only create weeks after your course is approved by the admin team.
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
                            This course is live and visible to students. Any changes to weeks will affect enrolled students.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weeks Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search weeks..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={openCreateDialog} 
                  disabled={!selectedCourse || !isCourseApproved}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Week
                </Button>
              </div>
            </div>

            {!selectedCourse ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
                <p className="text-muted-foreground">Please select a course to view weeks</p>
              </div>
            ) : !isCourseApproved ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Course Not Approved</h3>
                <p className="text-muted-foreground">
                  You can only manage weeks for approved courses. Please wait for admin approval.
                </p>
              </div>
            ) : isLoadingWeeks ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : weeks.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No weeks found</h3>
                <p className="text-muted-foreground mb-4">This course has no weeks yet.</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Week
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[100px]">Week #</TableHead>
                      <TableHead>Week Title</TableHead>
                      <TableHead className="w-[120px]">Lessons</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Created</TableHead>
                      <TableHead className="w-[150px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWeeks.map((week) => (
                      <React.Fragment key={week._id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleWeekExpansion(week._id)}
                            >
                              {expandedWeek === week._id ? (
                                <ChevronRight className="h-4 w-4 rotate-90" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {week.weekNumber}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{week.title}</div>
                              {week.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {week.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{week.lessonCount || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getWeekStatusBadge(week)}</TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {week.createdAt
                                ? new Date(week.createdAt).toLocaleDateString("en-US", {
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
                                onClick={() => openEditDialog(week)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(week)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Week Details Row */}
                        {expandedWeek === week._id && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-medium mb-2">Week Description</h4>
                                    <div className="p-3 bg-white rounded-md border">
                                      <p className="whitespace-pre-line text-sm">
                                        {week.description || "No description provided."}
                                      </p>
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

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Week" : "Create New Week"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Week Title *</Label>
                  <Input
                    name="title"
                    placeholder="e.g., Introduction to Python"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Week Number *</Label>
                  <Input
                    name="weekNumber"
                    type="number"
                    min="1"
                    value={formData.weekNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  name="description"
                  placeholder="What will students learn in this week?"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
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
                {isEditing ? "Update Week" : "Create Week"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </InstructorDashboardLayout>
  );
}