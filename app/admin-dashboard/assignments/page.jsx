"use client";
import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    ClipboardList,
    FolderOpen,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
import { assignmentAPI } from "@/lib/api/assignments";
import dynamic from "next/dynamic";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DynamicContentEditor = dynamic(() => import('@/components/editor/ContentEditor'), {
    ssr: false,
});

export default function AssignmentsPage() {
    const { showAlert } = useAlertDialog();

    const [activeTab, setActiveTab] = useState("by-lesson");
    const [courses, setCourses] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});

    // Pending and All submissions state
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [allLoading, setAllLoading] = useState(false);
    const [totalPending, setTotalPending] = useState(0);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [pendingSearchQuery, setPendingSearchQuery] = useState("");
    const [allSearchQuery, setAllSearchQuery] = useState("");
    const [allStatusFilter, setAllStatusFilter] = useState("all");

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedWeek, setSelectedWeek] = useState("");
    const [selectedLesson, setSelectedLesson] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedAssignment, setExpandedAssignment] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
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

    // Fetch pending submissions when tab changes
    useEffect(() => {
        if (activeTab === "pending-grading") {
            fetchPendingSubmissions();
        } else if (activeTab === "all-submissions") {
            fetchAllSubmissions();
        }
    }, [activeTab]);

    // Refetch data when page becomes visible (e.g., after grading on detail page)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (activeTab === "pending-grading") {
                    fetchPendingSubmissions();
                } else if (activeTab === "all-submissions") {
                    fetchAllSubmissions();
                }
            }
        };

        const handleFocus = () => {
            if (activeTab === "pending-grading") {
                fetchPendingSubmissions();
            } else if (activeTab === "all-submissions") {
                fetchAllSubmissions();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [activeTab]);

    const fetchPendingSubmissions = async () => {
        try {
            setPendingLoading(true);
            const response = await assignmentAPI.getPendingSubmissions({ limit: 100 });
            setPendingSubmissions(response.data || []);
            setTotalPending(response.totalPending || 0);
        } catch (error) {
            console.error('Error fetching pending submissions:', error);
            toast.error('Failed to load pending submissions');
        } finally {
            setPendingLoading(false);
        }
    };

    const fetchAllSubmissions = async () => {
        try {
            setAllLoading(true);
            const response = await assignmentAPI.getAllSubmissions({ limit: 200 });
            setAllSubmissions(response.data || []);
            setTotalSubmissions(response.total || 0);
        } catch (error) {
            console.error('Error fetching all submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setAllLoading(false);
        }
    };

    // Fetch weeks when course changes
    useEffect(() => {
        if (selectedCourse) {
            fetchWeeks();
            setSelectedWeek("");
            setSelectedLesson("");
            setAssignments([]);
        }
    }, [selectedCourse]);

    // Fetch lessons when week changes
    useEffect(() => {
        if (selectedWeek) {
            fetchLessons();
            setSelectedLesson("");
            setAssignments([]);
        }
    }, [selectedWeek]);

    // Fetch assignments when lesson changes
    useEffect(() => {
        if (selectedLesson) {
            fetchAssignmentsByLesson();
        } else {
            setAssignments([]);
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

    const fetchAssignmentsByLesson = async () => {
        if (!selectedLesson) return;

        setIsLoading(true);
        try {
            const response = await assignmentAPI.getAssignmentsByLesson(selectedLesson);
            setAssignments(response.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error(error.response?.data?.msg || 'Failed to load assignments');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const response = await assignmentAPI.getAssignmentSubmissions(assignmentId);
            setSubmissions(prev => ({
                ...prev,
                [assignmentId]: response.data || []
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
        setEditingAssignment(null);
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

    const openEditDialog = (assignment) => {
        setFormData({
            title: assignment.title,
            description: assignment.description || "",
            contents: assignment.contents,
            dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
            maxScore: assignment.maxScore,
            passingScore: assignment.passingScore,
            allowLateSubmission: assignment.allowLateSubmission,
            lateSubmissionPenalty: assignment.lateSubmissionPenalty,
            isActive: assignment.isActive,
        });
        setEditingAssignment(assignment);
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
            toast.error("Assignment title is required");
            return;
        }
        if (!formData.contents.trim()) {
            toast.error("Assignment contents are required");
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
            const assignmentData = {
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

            if (isEditing && editingAssignment) {
                await assignmentAPI.updateAssignment(editingAssignment._id, assignmentData);
                toast.success("Assignment updated successfully!");
            } else {
                await assignmentAPI.createAssignment(assignmentData);
                toast.success("Assignment created successfully!");
            }

            setIsDialogOpen(false);
            resetForm();
            fetchAssignmentsByLesson();
        } catch (error) {
            console.error('Error saving assignment:', error);
            toast.error(error.response?.data?.msg || 'Failed to save assignment');
        }
    };

    const handleGradeSubmit = async () => {
        if (!gradeData.score || isNaN(gradeData.score) || parseFloat(gradeData.score) < 0) {
            toast.error("Please enter a valid score");
            return;
        }

        if (!selectedSubmission) return;

        try {
            await assignmentAPI.gradeSubmission(selectedSubmission._id, {
                score: parseFloat(gradeData.score),
                feedback: gradeData.feedback.trim(),
            });

            toast.success("Submission graded successfully!");
            setIsGradingDialogOpen(false);
            fetchSubmissions(selectedSubmission.assignment._id);
        } catch (error) {
            console.error('Error grading submission:', error);
            toast.error(error.response?.data?.msg || 'Failed to grade submission');
        }
    };

    const handleDelete = (assignment) => {
        showAlert({
            title: "Delete Assignment",
            description: `Are you sure you want to delete "${assignment.title}"? This will also delete all submissions for this assignment.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
            onConfirm: async () => {
                try {
                    await assignmentAPI.deleteAssignment(assignment._id);
                    toast.success("Assignment deleted successfully!");
                    fetchAssignmentsByLesson();
                } catch (error) {
                    console.error('Error deleting assignment:', error);
                    toast.error(error.response?.data?.msg || 'Failed to delete assignment');
                }
            },
        });
    };

    const toggleAssignmentExpansion = async (assignmentId) => {
        if (expandedAssignment === assignmentId) {
            setExpandedAssignment(null);
        } else {
            setExpandedAssignment(assignmentId);
            if (!submissions[assignmentId]) {
                await fetchSubmissions(assignmentId);
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

    const getStatusInfo = (assignment) => {
        if (!assignment.isActive) {
            return { label: "Inactive", color: "bg-gray-100 text-gray-600", icon: XCircle };
        }

        const now = new Date();
        const dueDate = new Date(assignment.dueDate);

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

    const filteredAssignments = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignment.description && assignment.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminDashboardLayout>
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Assignments</h1>
                        <p className="text-gray-500 mt-1">Manage assignments and grade submissions</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    {activeTab === "by-lesson" && selectedLesson && (
                        <Button onClick={openCreateDialog} className="shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Assignment
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                        <TabsTrigger value="by-lesson" className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            By Lesson
                        </TabsTrigger>
                        <TabsTrigger value="pending-grading" className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Pending
                            {totalPending > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                    {totalPending > 99 ? "99+" : totalPending}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="all-submissions" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            All Submissions
                        </TabsTrigger>
                    </TabsList>

                    {/* By Lesson Tab */}
                    <TabsContent value="by-lesson" className="space-y-6">
                {/* Course Selection */}
                <Card className="shadow-sm border-gray-200">
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
                                    {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Search */}
                {selectedLesson && assignments.length > 0 && (
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

                {/* Assignments List */}
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
                ) : assignments.length === 0 ? (
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
                        {filteredAssignments.map((assignment) => {
                            const statusInfo = getStatusInfo(assignment);
                            const daysInfo = getDaysRemaining(assignment.dueDate);
                            const StatusIcon = statusInfo.icon;
                            const isExpanded = expandedAssignment === assignment._id;
                            const assignmentSubmissions = submissions[assignment._id] || [];

                            return (
                                <Card key={assignment._id} className="shadow-sm border-gray-200 overflow-hidden">
                                    <CardContent className="p-0">
                                        {/* Assignment Header */}
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {assignment.title}
                                                        </h3>
                                                        <Badge className={`${statusInfo.color} border-0 text-xs font-medium`}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                    {assignment.description && (
                                                        <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                                                            {assignment.description}
                                                        </p>
                                                    )}

                                                    {/* Stats Row */}
                                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{formatDate(assignment.dueDate)}</span>
                                                            <span className={`ml-1 ${daysInfo.color}`}>
                                                                ({daysInfo.text})
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Award className="h-4 w-4 text-gray-400" />
                                                            <span>{assignment.maxScore} pts</span>
                                                            <span className="text-gray-400">(pass: {assignment.passingScore})</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <Users className="h-4 w-4 text-gray-400" />
                                                            <span>{assignment.meta?.submissionsCount || 0} submissions</span>
                                                        </div>
                                                        {assignment.allowLateSubmission && (
                                                            <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50">
                                                                <Timer className="h-3 w-3 mr-1" />
                                                                Late: -{assignment.lateSubmissionPenalty}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleAssignmentExpansion(assignment._id)}
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
                                                                onClick={() => toggleAssignmentExpansion(assignment._id)}
                                                                className="sm:hidden"
                                                            >
                                                                <Users className="h-4 w-4 mr-2" />
                                                                View Submissions
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditDialog(assignment)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(assignment)}
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
                                                            Submissions ({assignmentSubmissions.length})
                                                        </h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => fetchSubmissions(assignment._id)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            Refresh
                                                        </Button>
                                                    </div>

                                                    {!submissions[assignment._id] ? (
                                                        <div className="flex justify-center py-8">
                                                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                                        </div>
                                                    ) : assignmentSubmissions.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                                            <p className="text-gray-500">No submissions yet</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {assignmentSubmissions.map((submission) => (
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
                                                                                    {submission.score}/{assignment.maxScore}
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
                                                                                onClick={() => window.open(`/admin-dashboard/assignments/${submission._id}`, '_blank')}
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
                    </TabsContent>

                    {/* Pending Grading Tab */}
                    <TabsContent value="pending-grading" className="space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            Pending Grading
                                            {totalPending > 0 && (
                                                <Badge variant="destructive">{totalPending} submissions</Badge>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            All submissions awaiting grading across all courses
                                        </p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:min-w-[300px]">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by assignment or student..."
                                                className="pl-10"
                                                value={pendingSearchQuery}
                                                onChange={(e) => setPendingSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={fetchPendingSubmissions}
                                            disabled={pendingLoading}
                                            title="Refresh"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${pendingLoading ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {pendingLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : pendingSubmissions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Pending Submissions</h3>
                                        <p className="text-muted-foreground">
                                            All caught up! There are no submissions waiting to be graded.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingSubmissions
                                            .filter(
                                                (item) =>
                                                    item.assignmentTitle?.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
                                                    item.courseName?.toLowerCase().includes(pendingSearchQuery.toLowerCase())
                                            )
                                            .map((item) => (
                                                <div
                                                    key={item.assignmentId}
                                                    className="rounded-lg border bg-card overflow-hidden"
                                                >
                                                    {/* Assignment Header */}
                                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-muted/30">
                                                        <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                                                            <ClipboardList className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-base truncate">
                                                                {item.assignmentTitle}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {item.courseName}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4" />
                                                                    {item.dueDate && new Date(item.dueDate) > new Date()
                                                                        ? `Due ${formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}`
                                                                        : item.dueDate
                                                                        ? `Overdue ${formatDistanceToNow(new Date(item.dueDate), { addSuffix: false })}`
                                                                        : "No due date"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Badge variant="destructive" className="text-sm shrink-0">
                                                            {item.pendingGrading} to grade
                                                        </Badge>
                                                    </div>

                                                    {/* Individual Submissions */}
                                                    <div className="divide-y">
                                                        {item.submissions?.map((sub) => (
                                                            <div
                                                                key={sub._id}
                                                                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                                        <Users className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-sm">
                                                                            {sub.submittedBy?.firstname} {sub.submittedBy?.lastname}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                            <span>
                                                                                {sub.submittedAt
                                                                                    ? formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })
                                                                                    : "Unknown"}
                                                                            </span>
                                                                            {sub.isLate && (
                                                                                <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                                                                    Late
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Link href={`/admin-dashboard/assignments/${sub._id}`}>
                                                                    <Button size="sm" variant="outline">
                                                                        <Award className="h-4 w-4 mr-2" />
                                                                        Grade
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* All Submissions Tab */}
                    <TabsContent value="all-submissions" className="space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            All Submissions
                                            {totalSubmissions > 0 && (
                                                <Badge variant="secondary">{totalSubmissions} total</Badge>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            View and manage all submissions across all courses
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:min-w-[250px]">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by student or assignment..."
                                                className="pl-10"
                                                value={allSearchQuery}
                                                onChange={(e) => setAllSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Select value={allStatusFilter} onValueChange={setAllStatusFilter}>
                                            <SelectTrigger className="w-full sm:w-[150px]">
                                                <SelectValue placeholder="Filter status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="graded">Graded</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={fetchAllSubmissions}
                                            disabled={allLoading}
                                            title="Refresh"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${allLoading ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {allLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : allSubmissions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                                        <p className="text-muted-foreground">
                                            There are no submissions across all courses yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead>Assignment</TableHead>
                                                    <TableHead>Course</TableHead>
                                                    <TableHead className="w-[150px]">Submitted</TableHead>
                                                    <TableHead className="w-[100px]">Status</TableHead>
                                                    <TableHead className="w-[100px]">Score</TableHead>
                                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {allSubmissions
                                                    .filter((submission) => {
                                                        // Filter by search query
                                                        const matchesSearch =
                                                            allSearchQuery === "" ||
                                                            `${submission.student?.firstname} ${submission.student?.lastname}`
                                                                .toLowerCase()
                                                                .includes(allSearchQuery.toLowerCase()) ||
                                                            submission.assignmentTitle
                                                                ?.toLowerCase()
                                                                .includes(allSearchQuery.toLowerCase()) ||
                                                            submission.courseName
                                                                ?.toLowerCase()
                                                                .includes(allSearchQuery.toLowerCase());

                                                        // Filter by status
                                                        const isGraded = submission.score !== undefined && submission.score !== null;
                                                        const matchesStatus =
                                                            allStatusFilter === "all" ||
                                                            (allStatusFilter === "graded" && isGraded) ||
                                                            (allStatusFilter === "pending" && !isGraded);

                                                        return matchesSearch && matchesStatus;
                                                    })
                                                    .map((submission) => {
                                                        const isGraded = submission.score !== undefined && submission.score !== null;
                                                        return (
                                                            <TableRow key={submission._id} className="hover:bg-muted/50">
                                                                <TableCell>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {submission.student?.firstname} {submission.student?.lastname}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {submission.student?.email}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">
                                                                        {submission.assignmentTitle || "Unknown Assignment"}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {submission.courseName || "Unknown Course"}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm">
                                                                        {submission.submittedAt
                                                                            ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })
                                                                            : "Unknown"}
                                                                    </div>
                                                                    {submission.isLate && (
                                                                        <Badge variant="destructive" className="text-[10px] px-1 py-0 mt-1">
                                                                            Late
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isGraded ? (
                                                                        <Badge className="bg-green-500 text-xs">Graded</Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-xs">Pending</Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isGraded ? (
                                                                        <div className="font-medium">
                                                                            {submission.score}/{submission.maxScore || 100}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground text-sm">—</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex justify-end">
                                                                        <Link href={`/admin-dashboard/assignments/${submission._id}`}>
                                                                            <Button size="sm" variant={isGraded ? "ghost" : "outline"}>
                                                                                {isGraded ? (
                                                                                    <>
                                                                                        <Eye className="h-4 w-4 mr-1" />
                                                                                        View
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Award className="h-4 w-4 mr-1" />
                                                                                        Grade
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

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
                                        Score * <span className="text-gray-400 font-normal">(max: {selectedSubmission.assignment?.maxScore || 100})</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={selectedSubmission.assignment?.maxScore || 100}
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

                                {selectedSubmission.isLate && selectedSubmission.assignment?.lateSubmissionPenalty > 0 && (
                                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Late Submission</p>
                                            <p className="text-xs text-yellow-600">
                                                A penalty of {selectedSubmission.assignment.lateSubmissionPenalty}% may apply
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
