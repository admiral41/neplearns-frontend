"use client";
import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Calendar,
    Clock,
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
    ChevronUp,
    Loader2,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Timer,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
import { assessmentAPI } from "@/lib/api/assessments";
import dynamic from "next/dynamic";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DynamicContentEditor = dynamic(() => import('@/components/editor/ContentEditor'), {
    ssr: false,
});

export default function AssessmentsPage() {
    const { showAlert } = useAlertDialog();

    const [courses, setCourses] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [submissions, setSubmissions] = useState({});

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedWeek, setSelectedWeek] = useState("");
    const [selectedLesson, setSelectedLesson] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedAssessment, setExpandedAssessment] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

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

    // Fetch courses on mount
    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch weeks when course changes
    useEffect(() => {
        if (selectedCourse) {
            fetchWeeks();
            setSelectedWeek("");
            setSelectedLesson("");
            setAssessments([]);
        }
    }, [selectedCourse]);

    // Fetch lessons when week changes
    useEffect(() => {
        if (selectedWeek) {
            fetchLessons();
            setSelectedLesson("");
            setAssessments([]);
        }
    }, [selectedWeek]);

    // Fetch assessments when lesson changes
    useEffect(() => {
        if (selectedLesson) {
            fetchAssessmentsByLesson();
        } else {
            setAssessments([]);
        }
    }, [selectedLesson]);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            const response = await courseAPI.getAllCourses({
                status: 'approved'
            });
            setCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setIsLoading(false);
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

        try {
            const response = await lessonAPI.getWeekLessons(selectedWeek);
            setLessons(response.data || []);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            toast.error('Failed to load lessons');
        }
    };

    const fetchAssessmentsByLesson = async () => {
        if (!selectedLesson) return;

        setIsLoading(true);
        try {
            const response = await assessmentAPI.getAssessmentsByLesson(selectedLesson);
            setAssessments(response.data || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            toast.error(error.response?.data?.msg || 'Failed to load assessments');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmissions = async (assessmentId) => {
        try {
            const response = await assessmentAPI.getAssessmentSubmissions(assessmentId);
            setSubmissions(prev => ({
                ...prev,
                [assessmentId]: response.data || []
            }));
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error(error.response?.data?.msg || 'Failed to load submissions');
        }
    };

    const selectedCourseData = courses.find(c => c._id === selectedCourse);
    const selectedLessonData = lessons.find(l => l._id === selectedLesson);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleContentsChange = (content) => {
        setFormData(prev => ({ ...prev, contents: content }));
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
        setEditingAssessment(null);
    };

    const openCreateDialog = () => {
        if (!selectedLesson) {
            toast.error("Please select a lesson first");
            return;
        }

        resetForm();

        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        setFormData(prev => ({
            ...prev,
            dueDate: defaultDueDate.toISOString().split('T')[0]
        }));

        setIsDialogOpen(true);
    };

    const openEditDialog = (assessment) => {
        setFormData({
            title: assessment.title,
            description: assessment.description || "",
            contents: assessment.contents,
            dueDate: new Date(assessment.dueDate).toISOString().split('T')[0],
            maxScore: assessment.maxScore,
            passingScore: assessment.passingScore,
            allowLateSubmission: assessment.allowLateSubmission,
            lateSubmissionPenalty: assessment.lateSubmissionPenalty,
            isActive: assessment.isActive,
        });
        setEditingAssessment(assessment);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const openGradeDialog = (submission) => {
        setSelectedSubmission(submission);
        setGradeData({
            score: submission.score || "",
            feedback: submission.feedback || "",
        });
        setIsGradingDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error("Assessment title is required");
            return;
        }
        if (!formData.contents.trim()) {
            toast.error("Assessment contents are required");
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

        try {
            const assessmentData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                contents: formData.contents.trim(),
                dueDate: formData.dueDate,
                maxScore: parseInt(formData.maxScore),
                passingScore: parseInt(formData.passingScore),
                lesson: selectedLesson,
                allowLateSubmission: formData.allowLateSubmission,
                lateSubmissionPenalty: parseInt(formData.lateSubmissionPenalty),
                isActive: formData.isActive,
            };

            if (isEditing && editingAssessment) {
                await assessmentAPI.updateAssessment(editingAssessment._id, assessmentData);
                toast.success("Assessment updated successfully!");
            } else {
                await assessmentAPI.createAssessment(assessmentData);
                toast.success("Assessment created successfully!");
            }

            setIsDialogOpen(false);
            resetForm();
            fetchAssessmentsByLesson();
        } catch (error) {
            console.error('Error saving assessment:', error);
            toast.error(error.response?.data?.msg || 'Failed to save assessment');
        }
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.score || isNaN(gradeData.score) || parseFloat(gradeData.score) < 0) {
            toast.error("Please enter a valid score");
            return;
        }

        if (!selectedSubmission) return;

        try {
            await assessmentAPI.gradeSubmission(selectedSubmission._id, {
                score: parseFloat(gradeData.score),
                feedback: gradeData.feedback.trim(),
            });

            toast.success("Submission graded successfully!");
            setIsGradingDialogOpen(false);
            fetchSubmissions(selectedSubmission.assessment._id);
        } catch (error) {
            console.error('Error grading submission:', error);
            toast.error(error.response?.data?.msg || 'Failed to grade submission');
        }
    };

    const handleDelete = (assessment) => {
        showAlert({
            title: "Delete Assessment",
            description: `Are you sure you want to delete "${assessment.title}"? This will also delete all submissions for this assessment.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
            onConfirm: async () => {
                try {
                    await assessmentAPI.deleteAssessment(assessment._id);
                    toast.success("Assessment deleted successfully!");
                    fetchAssessmentsByLesson();
                } catch (error) {
                    console.error('Error deleting assessment:', error);
                    toast.error(error.response?.data?.msg || 'Failed to delete assessment');
                }
            },
        });
    };

    const toggleAssessmentExpansion = async (assessmentId) => {
        if (expandedAssessment === assessmentId) {
            setExpandedAssessment(null);
        } else {
            setExpandedAssessment(assessmentId);
            if (!submissions[assessmentId]) {
                await fetchSubmissions(assessmentId);
            }
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatDateTime = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusInfo = (assessment) => {
        if (!assessment.isActive) {
            return { label: "Inactive", color: "bg-gray-100 text-gray-600", icon: XCircle };
        }

        const now = new Date();
        const dueDate = new Date(assessment.dueDate);

        if (now > dueDate) {
            return { label: "Closed", color: "bg-red-50 text-red-600", icon: XCircle };
        }

        return { label: "Active", color: "bg-green-50 text-green-600", icon: CheckCircle2 };
    };

    const getDaysRemaining = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", color: "text-red-500" };
        if (diffDays === 0) return { text: "Due today", color: "text-orange-500" };
        if (diffDays === 1) return { text: "1 day left", color: "text-orange-500" };
        if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-yellow-600" };
        return { text: `${diffDays} days left`, color: "text-gray-500" };
    };

    const filteredAssessments = assessments.filter(assessment =>
        assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assessment.description && assessment.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminDashboardLayout>
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
                        <p className="text-gray-500 mt-1">Manage assignments and grade submissions</p>
                    </div>

                    {selectedLesson && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateDialog} className="shadow-sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Assignment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">
                                        {isEditing ? "Edit Assignment" : "Create New Assignment"}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-5 py-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Title *</Label>
                                            <Input
                                                name="title"
                                                placeholder="Assignment title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="h-10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Due Date *</Label>
                                            <Input
                                                name="dueDate"
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={handleInputChange}
                                                className="h-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Description</Label>
                                        <Input
                                            name="description"
                                            placeholder="Brief description of the assignment"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="h-10"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Max Score</Label>
                                            <Input
                                                name="maxScore"
                                                type="number"
                                                min="0"
                                                max="1000"
                                                value={formData.maxScore}
                                                onChange={handleInputChange}
                                                className="h-10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Passing Score</Label>
                                            <Input
                                                name="passingScore"
                                                type="number"
                                                min="0"
                                                max={formData.maxScore}
                                                value={formData.passingScore}
                                                onChange={handleInputChange}
                                                className="h-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="allowLateSubmission"
                                                name="allowLateSubmission"
                                                checked={formData.allowLateSubmission}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="allowLateSubmission" className="cursor-pointer text-sm">
                                                Allow late submissions
                                            </Label>
                                        </div>

                                        {formData.allowLateSubmission && (
                                            <div className="ml-7 space-y-2">
                                                <Label className="text-sm font-medium">Late Penalty (%)</Label>
                                                <Input
                                                    name="lateSubmissionPenalty"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={formData.lateSubmissionPenalty}
                                                    onChange={handleInputChange}
                                                    className="h-10 max-w-[150px]"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Instructions *</Label>
                                        <div className="border rounded-lg overflow-hidden">
                                            <DynamicContentEditor
                                                model={formData.contents}
                                                handleModelChange={handleContentsChange}
                                                allowPaste={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Status</Label>
                                        <Select
                                            value={formData.isActive ? "active" : "inactive"}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({ ...prev, isActive: value === "active" }))
                                            }
                                        >
                                            <SelectTrigger className="h-10 max-w-[200px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit}>
                                        {isEditing ? "Update Assignment" : "Create Assignment"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Course Selection */}
                <Card className="mb-6 shadow-sm border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Course</Label>
                                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger className="h-10">
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

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Week</Label>
                                <Select value={selectedWeek} onValueChange={setSelectedWeek} disabled={!selectedCourse}>
                                    <SelectTrigger className="h-10">
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

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lesson</Label>
                                <Select value={selectedLesson} onValueChange={setSelectedLesson} disabled={!selectedWeek}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select lesson" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lessons.map((lesson) => (
                                            <SelectItem key={lesson._id} value={lesson._id}>
                                                {lesson.lessonTitle}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedCourseData && selectedLessonData && (
                            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{selectedCourseData.courseTitle}</p>
                                        <p className="text-xs text-gray-500">{selectedLessonData.lessonTitle}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    {assessments.length} assignment{assessments.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Search */}
                {selectedLesson && assessments.length > 0 && (
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search assignments..."
                                className="pl-10 h-10 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Assessments List */}
                {!selectedLesson ? (
                    <Card className="shadow-sm border-gray-200">
                        <CardContent className="py-16">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Lesson</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Choose a course, week, and lesson from the filters above to view and manage assignments.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : isLoading ? (
                    <Card className="shadow-sm border-gray-200">
                        <CardContent className="py-16">
                            <div className="flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                                <p className="text-gray-500">Loading assignments...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : assessments.length === 0 ? (
                    <Card className="shadow-sm border-gray-200">
                        <CardContent className="py-16">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                    This lesson doesn't have any assignments. Create your first one to get started.
                                </p>
                                <Button onClick={openCreateDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Assignment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredAssessments.map((assessment) => {
                            const statusInfo = getStatusInfo(assessment);
                            const daysInfo = getDaysRemaining(assessment.dueDate);
                            const StatusIcon = statusInfo.icon;
                            const isExpanded = expandedAssessment === assessment._id;
                            const assessmentSubmissions = submissions[assessment._id] || [];

                            return (
                                <Card key={assessment._id} className="shadow-sm border-gray-200 overflow-hidden">
                                    <CardContent className="p-0">
                                        {/* Assessment Header */}
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {assessment.title}
                                                        </h3>
                                                        <Badge className={`${statusInfo.color} border-0 text-xs font-medium`}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                    {assessment.description && (
                                                        <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                                                            {assessment.description}
                                                        </p>
                                                    )}

                                                    {/* Stats Row */}
                                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{formatDate(assessment.dueDate)}</span>
                                                            <span className={`ml-1 ${daysInfo.color}`}>
                                                                ({daysInfo.text})
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Award className="h-4 w-4 text-gray-400" />
                                                            <span>{assessment.maxScore} pts</span>
                                                            <span className="text-gray-400">(pass: {assessment.passingScore})</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Users className="h-4 w-4 text-gray-400" />
                                                            <span>{assessment.meta?.submissionsCount || 0} submissions</span>
                                                        </div>
                                                        {assessment.allowLateSubmission && (
                                                            <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50">
                                                                <Timer className="h-3 w-3 mr-1" />
                                                                Late: -{assessment.lateSubmissionPenalty}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleAssessmentExpansion(assessment._id)}
                                                        className="hidden sm:flex"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="h-4 w-4 mr-1" />
                                                                Hide
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Users className="h-4 w-4 mr-1" />
                                                                Submissions
                                                            </>
                                                        )}
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => toggleAssessmentExpansion(assessment._id)}
                                                                className="sm:hidden"
                                                            >
                                                                <Users className="h-4 w-4 mr-2" />
                                                                View Submissions
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditDialog(assessment)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(assessment)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submissions Panel */}
                                        {isExpanded && (
                                            <div className="border-t bg-gray-50">
                                                <div className="p-4 sm:p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-medium text-gray-900">
                                                            Submissions ({assessmentSubmissions.length})
                                                        </h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => fetchSubmissions(assessment._id)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            Refresh
                                                        </Button>
                                                    </div>

                                                    {!submissions[assessment._id] ? (
                                                        <div className="flex justify-center py-8">
                                                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                                        </div>
                                                    ) : assessmentSubmissions.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                                            <p className="text-gray-500">No submissions yet</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {assessmentSubmissions.map((submission) => (
                                                                <div
                                                                    key={submission._id}
                                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                                                >
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                                                            {submission.submittedBy?.firstname?.[0]}{submission.submittedBy?.lastname?.[0]}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                                                {submission.submittedBy?.firstname} {submission.submittedBy?.lastname}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                                                                <span>{formatDateTime(submission.createdAt)}</span>
                                                                                {submission.isLate && (
                                                                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                                                        Late
                                                                                    </Badge>
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        {submission.score !== undefined && submission.score !== null ? (
                                                                            <div className="text-right">
                                                                                <p className="font-semibold text-gray-900">
                                                                                    {submission.score}/{assessment.maxScore}
                                                                                </p>
                                                                                <Badge className="bg-green-50 text-green-600 border-0 text-[10px]">
                                                                                    Graded
                                                                                </Badge>
                                                                            </div>
                                                                        ) : (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Pending
                                                                            </Badge>
                                                                        )}

                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => window.open(`/admin-dashboard/assessments/${submission._id}`, '_blank')}
                                                                                title="View"
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => openGradeDialog(submission)}
                                                                                title="Grade"
                                                                            >
                                                                                <Award className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Grade Submission Dialog */}
                <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Grade Submission</DialogTitle>
                        </DialogHeader>

                        {selectedSubmission && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                        {selectedSubmission.submittedBy?.firstname?.[0]}{selectedSubmission.submittedBy?.lastname?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {selectedSubmission.submittedBy?.firstname} {selectedSubmission.submittedBy?.lastname}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {selectedSubmission.submittedBy?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        Score * <span className="text-gray-400 font-normal">(max: {selectedSubmission.assessment?.maxScore || 100})</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={selectedSubmission.assessment?.maxScore || 100}
                                        value={gradeData.score}
                                        onChange={(e) => setGradeData(prev => ({ ...prev, score: e.target.value }))}
                                        placeholder="Enter score"
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Feedback</Label>
                                    <textarea
                                        className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                                        placeholder="Provide feedback to the student..."
                                    />
                                </div>

                                {selectedSubmission.isLate && selectedSubmission.assessment?.lateSubmissionPenalty > 0 && (
                                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Late Submission</p>
                                            <p className="text-xs text-yellow-600">
                                                A penalty of {selectedSubmission.assessment.lateSubmissionPenalty}% may apply
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleGradeSubmit}>
                                Save Grade
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminDashboardLayout>
    );
}
