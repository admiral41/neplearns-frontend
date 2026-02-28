"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    Users,
    BarChart3,
    Eye,
    Edit,
    Copy,
    Trash2,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Download,
    Share2,
    Link as LinkIcon,
    Layers,
    Hash,
    Target,
    Timer,
    Sparkles,
    FolderOpen,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    BookOpen,
    CalendarDays,
    User,
    Award,
    Zap,
    AlertCircle,
    CalendarClock,
} from "lucide-react";
import { quizAPI } from "@/lib/api/quizzes";
import { courseAPI } from "@/lib/api/courses";

export default function QuizzesDashboardPage() {
    const router = useRouter();

    // State
    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Sorting state
    const [sortField, setSortField] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        draft: 0,
        ended: 0,
        upcoming: 0,
        totalResponses: 0,
        avgCompletionRate: 0,
    });

    // Fetch data
    useEffect(() => {
        fetchQuizzes();
        fetchCourses();
    }, []);

    // Filter and sort quizzes
    useEffect(() => {
        let filtered = quizzes;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(quiz =>
                quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quiz.course?.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Course filter
        if (selectedCourse !== "all") {
            filtered = filtered.filter(quiz => quiz.course?._id === selectedCourse);
        }

        // Status filter
        if (selectedStatus !== "all") {
            const now = new Date();
            filtered = filtered.filter(quiz => {
                if (selectedStatus === "active") {
                    return quiz.isPublished &&
                        (!quiz.startDate || now >= new Date(quiz.startDate)) &&
                        (!quiz.endDate || now <= new Date(quiz.endDate));
                }
                if (selectedStatus === "draft") return !quiz.isPublished;
                if (selectedStatus === "upcoming") {
                    return quiz.isPublished && quiz.startDate && now < new Date(quiz.startDate);
                }
                if (selectedStatus === "ended") {
                    return quiz.isPublished && quiz.endDate && now > new Date(quiz.endDate);
                }
                return true;
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case "title":
                    aValue = a.title?.toLowerCase() || "";
                    bValue = b.title?.toLowerCase() || "";
                    break;
                case "course":
                    aValue = a.course?.courseTitle?.toLowerCase() || "";
                    bValue = b.course?.courseTitle?.toLowerCase() || "";
                    break;
                case "endDate":
                    aValue = a.endDate ? new Date(a.endDate).getTime() : Infinity;
                    bValue = b.endDate ? new Date(b.endDate).getTime() : Infinity;
                    break;
                case "createdAt":
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case "responses":
                    aValue = a.responsesCount || 0;
                    bValue = b.responsesCount || 0;
                    break;
                case "questions":
                    aValue = a.questions?.length || 0;
                    bValue = b.questions?.length || 0;
                    break;
                default:
                    aValue = a[sortField] || "";
                    bValue = b[sortField] || "";
            }

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredQuizzes(filtered);
    }, [quizzes, searchQuery, selectedCourse, selectedStatus, sortField, sortDirection]);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            const response = await quizAPI.getAllQuizzes();
            const quizzesData = response.data || [];
            setQuizzes(quizzesData);
            calculateStats(quizzesData);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            toast.error('Failed to load quizzes');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getAllCourses();
            setCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const calculateStats = (quizzesList) => {
        const now = new Date();

        const total = quizzesList.length;
        const active = quizzesList.filter(quiz =>
            quiz.isPublished &&
            (!quiz.startDate || now >= new Date(quiz.startDate)) &&
            (!quiz.endDate || now <= new Date(quiz.endDate))
        ).length;
        const draft = quizzesList.filter(quiz => !quiz.isPublished).length;
        const ended = quizzesList.filter(quiz =>
            quiz.isPublished && quiz.endDate && now > new Date(quiz.endDate)
        ).length;
        const upcoming = quizzesList.filter(quiz =>
            quiz.isPublished && quiz.startDate && now < new Date(quiz.startDate)
        ).length;

        const totalResponses = quizzesList.reduce((sum, quiz) => sum + (quiz.responsesCount || 0), 0);
        const avgCompletionRate = quizzesList.length > 0
            ? quizzesList.reduce((sum, quiz) => sum + (quiz.completionRate || 0), 0) / quizzesList.length
            : 0;

        setStats({ total, active, draft, ended, upcoming, totalResponses, avgCompletionRate });
    };

    const handleDeleteQuiz = async () => {
        if (!quizToDelete) return;

        try {
            await quizAPI.deleteQuiz(quizToDelete._id);
            toast.success("Quiz deleted successfully!");
            fetchQuizzes();
        } catch (error) {
            console.error('Error deleting quiz:', error);
            toast.error('Failed to delete quiz');
        } finally {
            setDeleteConfirmOpen(false);
            setQuizToDelete(null);
        }
    };

    const handleDuplicateQuiz = async (quiz) => {
        try {
            await quizAPI.duplicateQuiz(quiz._id, `${quiz.title} (Copy)`);
            toast.success("Quiz duplicated successfully!");
            fetchQuizzes();
        } catch (error) {
            console.error('Error duplicating quiz:', error);
            toast.error('Failed to duplicate quiz');
        }
    };

    const handleTogglePublish = async (quiz) => {
        try {
            await quizAPI.togglePublish(quiz._id, !quiz.isPublished);
            toast.success(quiz.isPublished ? "Quiz unpublished!" : "Quiz published!");
            fetchQuizzes();
        } catch (error) {
            console.error('Error toggling publish:', error);
            toast.error('Failed to update quiz');
        }
    };

    const getStatusBadge = (quiz) => {
        const now = new Date();
        const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
        const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

        if (!quiz.isPublished) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                    <FileText className="h-3 w-3 mr-1" />
                    Draft
                </Badge>
            );
        } else if (startDate && now < startDate) {
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    Upcoming
                </Badge>
            );
        } else if (endDate && now > endDate) {
            return (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Ended
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                </Badge>
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeRemaining = (endDate) => {
        if (!endDate) return null;
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) return "Ended";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;

        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes}m`;
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
        return sortDirection === "asc"
            ? <ChevronUp className="h-4 w-4 ml-1" />
            : <ChevronDown className="h-4 w-4 ml-1" />;
    };

    const copyQuizLink = (quiz) => {
        const link = `${window.location.origin}/quiz/${quiz._id}`;
        navigator.clipboard.writeText(link);
        toast.success("Quiz link copied to clipboard!");
    };

    return (
        <AdminDashboardLayout>
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold">Quizzes Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage all quizzes, view analytics, and track student progress
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchQuizzes}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={() => router.push('/admin-dashboard/quizzes/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Quiz
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold">{stats.active}</p>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Draft</p>
                                    <p className="text-2xl font-bold">{stats.draft}</p>
                                </div>
                                <FileText className="h-5 w-5 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Upcoming</p>
                                    <p className="text-2xl font-bold">{stats.upcoming}</p>
                                </div>
                                <Calendar className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ended</p>
                                    <p className="text-2xl font-bold">{stats.ended}</p>
                                </div>
                                <Clock className="h-5 w-5 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Responses</p>
                                    <p className="text-2xl font-bold">{stats.totalResponses}</p>
                                </div>
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Completion</p>
                                    <p className="text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search quizzes, courses, or descriptions..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <select
                                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="all">All Courses</option>
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id}>
                                            {course.courseTitle}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ended">Ended</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quizzes Table */}
                {isLoading ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading quizzes...</p>
                        </CardContent>
                    </Card>
                ) : filteredQuizzes.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || selectedCourse !== 'all' || selectedStatus !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Create your first quiz to get started'}
                            </p>
                            <Button onClick={() => router.push('/admin-dashboard/quizzes/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Quiz
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Quizzes</CardTitle>
                                    <CardDescription>
                                        Showing {filteredQuizzes.length} of {quizzes.length} quizzes
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Export functionality
                                        toast.info("Export feature coming soon!");
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-semibold"
                                                    onClick={() => handleSort("title")}
                                                >
                                                    Quiz Title
                                                    <SortIcon field="title" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[150px]">
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-semibold"
                                                    onClick={() => handleSort("course")}
                                                >
                                                    Course
                                                    <SortIcon field="course" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[100px]">
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-semibold"
                                                    onClick={() => handleSort("questions")}
                                                >
                                                    Questions
                                                    <SortIcon field="questions" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[100px]">
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-semibold"
                                                    onClick={() => handleSort("responses")}
                                                >
                                                    Responses
                                                    <SortIcon field="responses" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[120px]">Status</TableHead>
                                            <TableHead className="w-[150px]">
                                                <Button
                                                    variant="ghost"
                                                    className="p-0 font-semibold"
                                                    onClick={() => handleSort("endDate")}
                                                >
                                                    End Date/Time
                                                    <SortIcon field="endDate" />
                                                </Button>
                                            </TableHead>
                                            <TableHead className="w-[100px]">Time Left</TableHead>
                                            <TableHead className="w-[80px]">Duration</TableHead>
                                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredQuizzes.map((quiz) => (
                                            <TableRow key={quiz._id} className="hover:bg-muted/50">
                                                {/* Quiz Title & Info */}
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="font-medium flex items-center gap-2">
                                                            {quiz.title}
                                                            {quiz.isTimed && (
                                                                <Timer className="h-3 w-3 text-amber-500" />
                                                            )}
                                                        </div>
                                                        {quiz.description && (
                                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                                {quiz.description}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Created: {formatDate(quiz.createdAt)}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Course */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {quiz.course?.courseTitle || "No Course"}
                                                        </span>
                                                    </div>
                                                    {quiz.week && (
                                                        <div className="text-xs text-muted-foreground ml-6">
                                                            Week {quiz.week?.weekNumber}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Questions */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {quiz.questions?.length || 0}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {quiz.totalPoints || 0} pts
                                                    </div>
                                                </TableCell>

                                                {/* Responses */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {quiz.responsesCount || 0}
                                                        </span>
                                                    </div>
                                                    {quiz.maxAttempts > 1 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {quiz.maxAttempts} attempts
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    {getStatusBadge(quiz)}
                                                    {quiz.passingScore > 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Pass: {quiz.passingScore}%
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* End Date/Time */}
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {quiz.endDate ? formatDate(quiz.endDate) : "No end date"}
                                                            </span>
                                                        </div>
                                                        {quiz.endDate && (
                                                            <div className="text-xs text-muted-foreground ml-6">
                                                                {new Date(quiz.endDate).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Time Left */}
                                                <TableCell>
                                                    {quiz.endDate ? (
                                                        <div className={`font-medium ${getTimeRemaining(quiz.endDate) === "Ended" ? "text-red-600" : "text-amber-600"}`}>
                                                            {getTimeRemaining(quiz.endDate)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>

                                                {/* Duration */}
                                                <TableCell>
                                                    {quiz.duration ? (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>{quiz.duration} min</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Quiz Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => router.push(`/admin-dashboard/quizzes/edit/${quiz._id}`)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Quiz
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/admin-dashboard/quizzes/${quiz._id}/questions`)}>
                                                                <Hash className="h-4 w-4 mr-2" />
                                                                Manage Questions
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/admin-dashboard/quizzes/${quiz._id}/results`)}>
                                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                                View Results
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/quiz/${quiz._id}`)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Preview
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => copyQuizLink(quiz)}>
                                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                                Copy Link
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDuplicateQuiz(quiz)}>
                                                                <Copy className="h-4 w-4 mr-2" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleTogglePublish(quiz)}>
                                                                {quiz.isPublished ? (
                                                                    <>
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Unpublish
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Publish
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onClick={() => {
                                                                    setQuizToDelete(quiz);
                                                                    setDeleteConfirmOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    {/* Quick Action Buttons */}
                                                    <div className="flex gap-1 mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/admin-dashboard/quizzes/edit/${quiz._id}`)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => router.push(`/admin-dashboard/quizzes/${quiz._id}/results`)}
                                                            title="Results"
                                                        >
                                                            <BarChart3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => copyQuizLink(quiz)}
                                                            title="Copy Link"
                                                        >
                                                            <LinkIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Table Footer */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {filteredQuizzes.length} quizzes
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // Previous page
                                        }}
                                        disabled={true}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // Next page
                                        }}
                                        disabled={true}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{quizToDelete?.title}"?
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span>This will delete all questions, student attempts, and results.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span>This action cannot be undone.</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setQuizToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteQuiz}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Quiz
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminDashboardLayout>
    );
}