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
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
  FileText,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";

export default function WeeksPage() {
  const { showAlert } = useAlertDialog();
  const [courses, setCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWeek, setEditingWeek] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    weekNumber: "",
    description: "",
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
    } else {
      setWeeks([]);
    }
  }, [selectedCourse]);

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
    
    setIsLoading(true);
    try {
      const response = await weekAPI.getWeeksByCourse(selectedCourse);
      setWeeks(response.data || []);
    } catch (error) {
      console.error('Error fetching weeks:', error);
      toast.error('Failed to load weeks');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    resetForm();
    const nextWeekNumber = weeks.length > 0 
      ? Math.max(...weeks.map(w => w.weekNumber)) + 1 
      : 1;
    setFormData(prev => ({
      ...prev,
      weekNumber: nextWeekNumber.toString()
    }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (week) => {
    setFormData({
      title: week.title,
      weekNumber: week.weekNumber.toString(),
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

    try {
      const weekData = {
        course: selectedCourse,
        title: formData.title.trim(),
        weekNumber: parseInt(formData.weekNumber),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      if (isEditing && editingWeek) {
        await weekAPI.updateWeek(editingWeek._id, weekData);
        toast.success("Week updated!");
      } else {
        await weekAPI.createWeek(weekData);
        toast.success("Week created!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchWeeks();
    } catch (error) {
      console.error('Error saving week:', error);
      toast.error(error.message || 'Failed to save week');
    }
  };

  const handleDelete = (week) => {
    showAlert({
      title: "Delete Week",
      description: `Are you sure you want to delete "${week.title}"? This will also delete all lessons in this week.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await weekAPI.deleteWeek(week._id);
          toast.success("Week deleted!");
          fetchWeeks();
        } catch (error) {
          console.error('Error deleting week:', error);
          toast.error(error.message || 'Failed to delete week');
        }
      },
    });
  };

  const handleReorder = async (week, direction) => {
    try {
      await weekAPI.reorderWeek(week._id, direction);
      toast.success(`Week moved ${direction}`);
      fetchWeeks();
    } catch (error) {
      console.error('Error reordering week:', error);
      toast.error(error.message || 'Failed to reorder week');
    }
  };

  const toggleWeekExpansion = (weekId) => {
    if (expandedWeek === weekId) {
      setExpandedWeek(null);
    } else {
      setExpandedWeek(weekId);
    }
  };

  const getStatusBadge = (week) => {
    if (week.isActive) {
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

  const filteredWeeks = weeks
    .filter(week =>
      week.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (week.description && week.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => a.weekNumber - b.weekNumber);

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Weeks</h1>
            <p className="text-muted-foreground mt-1">Manage course weeks</p>
          </div>
        </div>

        {/* Course Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
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
              
              {selectedCourseData && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{selectedCourseData.courseTitle}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedCourseData.learn_type}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {weeks.length} week{weeks.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
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
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Week
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
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
              </div>
            </div>

            {!selectedCourse ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
                <p className="text-muted-foreground">
                  Please select a course to view weeks
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : weeks.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No weeks found</h3>
                <p className="text-muted-foreground mb-4">
                  This course has no weeks yet.
                </p>
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
                    {filteredWeeks.map((week, index) => (
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
                                <ChevronDownIcon className="h-4 w-4" />
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
                          <TableCell>
                            {getStatusBadge(week)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(week.createdAt).toLocaleDateString('en-US', {
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
                                  onClick={() => handleReorder(week, 'up')}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleReorder(week, 'down')}
                                  disabled={index === weeks.length - 1}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
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
                              <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2">Week Description</h4>
                                    <div className="p-3 bg-white rounded-md border max-h-[150px] overflow-y-auto">
                                      <p className="whitespace-pre-line text-sm">
                                        {week.description || "No description provided."}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Week Details</h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status:</span>
                                        {getStatusBadge(week)}
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Course:</span>
                                        <span className="text-sm">
                                          {selectedCourseData?.courseTitle}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                                        <span className="text-sm">
                                          {new Date(week.updatedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      
                                      <div className="pt-3">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full"
                                          onClick={() => window.open(`/admin/weeks/${week._id}/lessons`, '_blank')}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Lessons
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