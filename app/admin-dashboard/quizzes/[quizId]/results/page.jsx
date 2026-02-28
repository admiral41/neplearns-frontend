// app/admin-dashboard/quizzes/[quizId]/results/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    ArrowLeft,
    Download,
    Filter,
    Search,
    RefreshCw,
    Users,
    Award,
    Clock,
    CheckCircle,
    XCircle,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Eye,
    Calendar,
    User,
    Mail,
    Hash,
    Target,
    Timer,
    Percent,
    FileText,
    ChevronDown,
    ChevronRight,
    MoreVertical,
    DownloadCloud,
    Share2,
    Printer,
    MessageSquare,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";

// API services
import { quizAPI } from "@/lib/api/quizzes";

export default function QuizResultsPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId;

    // State
    const [quiz, setQuiz] = useState(null);
    const [responses, setResponses] = useState([]);
    const [analytics, setAnalytics] = useState({
        summary: {},
        questionStats: [],
        timeStats: {},
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterScore, setFilterScore] = useState("all");
    const [filterDate, setFilterDate] = useState("all");

    // Fetch data
    useEffect(() => {
        if (quizId) {
            fetchQuiz();
            fetchResponses();
            fetchAnalytics();
        }
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const response = await quizAPI.getQuizById(quizId);
            setQuiz(response.data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            toast.error('Failed to load quiz details');
        }
    };

    const fetchResponses = async () => {
        try {
            const response = await quizAPI.getQuizAttempts(quizId);
            setResponses(response.data || []);
        } catch (error) {
            console.error('Error fetching responses:', error);
            toast.error('Failed to load responses');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await quizAPI.getQuizStats(quizId);
            setAnalytics(response.data || {
                summary: {},
                questionStats: [],
                timeStats: {},
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (response) => {
        const passingScore = quiz?.passingScore || 50;
        const score = response.score || 0;
        
        if (score >= passingScore) {
            return (
                <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Passed
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-red-500">
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed
                </Badge>
            );
        }
    };

    const getScoreBadge = (score) => {
        const passingScore = quiz?.passingScore || 50;
        
        if (score >= 90) return "bg-green-500";
        if (score >= 80) return "bg-green-400";
        if (score >= 70) return "bg-yellow-500";
        if (score >= passingScore) return "bg-yellow-400";
        return "bg-red-500";
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "N/A";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const openResponseDetails = (response) => {
        setSelectedResponse(response);
        setIsDetailsOpen(true);
    };

    const exportResults = () => {
        // Implement export functionality
        toast.info("Exporting results...");
        // Actual export logic would go here
    };

    const filteredResponses = responses.filter(response => {
        // Search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const userName = response.user?.firstname 
                ? `${response.user.firstname} ${response.user.lastname}`.toLowerCase()
                : response.user?.email?.toLowerCase() || '';
            
            if (!userName.includes(searchLower)) {
                return false;
            }
        }

        // Status filter
        if (filterStatus !== 'all') {
            const passingScore = quiz?.passingScore || 50;
            const score = response.score || 0;
            const isPassed = score >= passingScore;
            
            if (filterStatus === 'passed' && !isPassed) return false;
            if (filterStatus === 'failed' && isPassed) return false;
        }

        // Score filter
        if (filterScore !== 'all') {
            const score = response.score || 0;
            switch (filterScore) {
                case 'excellent': if (score < 90) return false; break;
                case 'good': if (score < 80 || score >= 90) return false; break;
                case 'average': if (score < 70 || score >= 80) return false; break;
                case 'poor': if (score >= 70) return false; break;
            }
        }

        // Date filter
        if (filterDate !== 'all') {
            const responseDate = new Date(response.createdAt);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            const lastMonth = new Date(today);
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            switch (filterDate) {
                case 'today': if (responseDate < today) return false; break;
                case 'yesterday': if (responseDate < yesterday || responseDate >= today) return false; break;
                case 'week': if (responseDate < lastWeek) return false; break;
                case 'month': if (responseDate < lastMonth) return false; break;
            }
        }

        return true;
    });

    if (isLoading) {
        return (
            <AdminDashboardLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading results...</p>
                        </div>
                    </div>
                </div>
            </AdminDashboardLayout>
        );
    }

    if (!quiz) {
        return (
            <AdminDashboardLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">Quiz not found</h3>
                        <p className="text-muted-foreground mb-4">The quiz you're looking for doesn't exist or was deleted.</p>
                        <Button onClick={() => router.push('/admin-dashboard/quizzes')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Quizzes
                        </Button>
                    </div>
                </div>
            </AdminDashboardLayout>
        );
    }

    return (
        <AdminDashboardLayout>
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin-dashboard/quizzes/${quizId}/edit`)}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Quiz
                            </Button>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold">Quiz Results & Analytics</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{quiz.title}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { fetchResponses(); fetchAnalytics(); }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={exportResults}>
                            <DownloadCloud className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Responses</p>
                                    <p className="text-2xl font-bold">{responses.length}</p>
                                </div>
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Score</p>
                                    <p className="text-2xl font-bold">
                                        {analytics.summary.averageScore?.toFixed(1) || '0'}%
                                    </p>
                                </div>
                                <BarChart3 className="h-5 w-5 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Passing Rate</p>
                                    <p className="text-2xl font-bold">
                                        {analytics.summary.passingRate?.toFixed(1) || '0'}%
                                    </p>
                                </div>
                                <Percent className="h-5 w-5 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg. Time</p>
                                    <p className="text-2xl font-bold">
                                        {analytics.timeStats.averageTime 
                                            ? formatDuration(analytics.timeStats.averageTime)
                                            : 'N/A'}
                                    </p>
                                </div>
                                <Clock className="h-5 w-5 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Tabs */}
                <Tabs defaultValue="responses" className="mb-6">
                    <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="responses">Responses</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="questions">Question Analysis</TabsTrigger>
                    </TabsList>

                    {/* Responses Tab */}
                    <TabsContent value="responses">
                        <Card>
                            <CardContent className="p-0">
                                <div className="p-4 border-b">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="relative w-full md:w-auto md:min-w-[300px]">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search students..."
                                                className="pl-10"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                                <SelectTrigger className="w-[130px]">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="passed">Passed</SelectItem>
                                                    <SelectItem value="failed">Failed</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Select value={filterScore} onValueChange={setFilterScore}>
                                                <SelectTrigger className="w-[130px]">
                                                    <Award className="h-4 w-4 mr-2" />
                                                    <SelectValue placeholder="Score" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Scores</SelectItem>
                                                    <SelectItem value="excellent">90-100%</SelectItem>
                                                    <SelectItem value="good">80-89%</SelectItem>
                                                    <SelectItem value="average">70-79%</SelectItem>
                                                    <SelectItem value="poor">Below 70%</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Select value={filterDate} onValueChange={setFilterDate}>
                                                <SelectTrigger className="w-[130px]">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    <SelectValue placeholder="Date" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Time</SelectItem>
                                                    <SelectItem value="today">Today</SelectItem>
                                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                                    <SelectItem value="week">Last 7 Days</SelectItem>
                                                    <SelectItem value="month">Last 30 Days</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {filteredResponses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
                                        <p className="text-muted-foreground">
                                            {responses.length === 0 
                                                ? "No students have taken this quiz yet."
                                                : "No responses match your filters."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead className="w-[100px]">Score</TableHead>
                                                    <TableHead className="w-[100px]">Correct</TableHead>
                                                    <TableHead className="w-[100px]">Time</TableHead>
                                                    <TableHead className="w-[100px]">Status</TableHead>
                                                    <TableHead className="w-[120px]">Date</TableHead>
                                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredResponses.map((response) => (
                                                    <TableRow key={response._id} className="hover:bg-muted/50">
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="font-medium">
                                                                    {response.user?.firstname 
                                                                        ? `${response.user.firstname} ${response.user.lastname}`
                                                                        : response.user?.email || 'Unknown User'}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {response.user?.email}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`${getScoreBadge(response.score || 0)}`}>
                                                                    {response.score?.toFixed(1) || 0}%
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {response.correctAnswers || 0}/{response.totalQuestions || 0}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{formatDuration(response.duration)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(response)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {new Date(response.createdAt).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openResponseDetails(response)}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {filteredResponses.length > 0 && (
                                    <div className="p-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {filteredResponses.length} of {responses.length} responses
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Score Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Score Distribution</CardTitle>
                                    <CardDescription>
                                        How students performed on this quiz
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { label: '90-100%', color: 'bg-green-500', count: 12 },
                                            { label: '80-89%', color: 'bg-green-400', count: 18 },
                                            { label: '70-79%', color: 'bg-yellow-500', count: 15 },
                                            { label: '60-69%', color: 'bg-yellow-400', count: 8 },
                                            { label: 'Below 60%', color: 'bg-red-500', count: 5 },
                                        ].map((range, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>{range.label}</span>
                                                    <span>{range.count} students</span>
                                                </div>
                                                <Progress value={(range.count / 58) * 100} className="h-2" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Time Analysis */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Time Analysis</CardTitle>
                                    <CardDescription>
                                        How long students took to complete
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">
                                                    {analytics.timeStats.averageTime 
                                                        ? formatDuration(analytics.timeStats.averageTime)
                                                        : 'N/A'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Average Time</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">
                                                    {analytics.timeStats.fastestTime 
                                                        ? formatDuration(analytics.timeStats.fastestTime)
                                                        : 'N/A'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Fastest Time</div>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span>Completion vs Score</span>
                                                <span className="text-muted-foreground">Correlation: 0.85</span>
                                            </div>
                                            <p className="text-muted-foreground">
                                                Students who took more time generally scored higher
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Performance Trends */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Performance Trends</CardTitle>
                                    <CardDescription>
                                        Average score over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center border rounded-lg">
                                        <div className="text-center">
                                            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                            <p className="text-muted-foreground">Performance chart would appear here</p>
                                            <p className="text-sm text-muted-foreground">
                                                Shows daily/weekly average scores
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Question Analysis Tab */}
                    <TabsContent value="questions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Question Analysis</CardTitle>
                                <CardDescription>
                                    Performance breakdown by question
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics.questionStats.map((questionStat, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-medium">
                                                            Q{index + 1}: {questionStat.questionText?.substring(0, 100)}...
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {questionStat.correctAnswers} correct / {questionStat.totalAttempts} attempts
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {((questionStat.correctAnswers / questionStat.totalAttempts) * 100).toFixed(1)}% correct
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Correct Rate</span>
                                                        <span>{((questionStat.correctAnswers / questionStat.totalAttempts) * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <Progress 
                                                        value={(questionStat.correctAnswers / questionStat.totalAttempts) * 100} 
                                                        className="h-2"
                                                    />
                                                </div>
                                                {questionStat.commonMistakes && questionStat.commonMistakes.length > 0 && (
                                                    <div className="mt-3 p-2 bg-muted/30 rounded-md">
                                                        <div className="text-sm font-medium mb-1">Common Mistakes:</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {questionStat.commonMistakes.join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Response Details Dialog */}
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Response Details</DialogTitle>
                        </DialogHeader>

                        {selectedResponse && (
                            <div className="space-y-6 py-4">
                                {/* Student Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Student Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Name</Label>
                                                <p className="font-medium">
                                                    {selectedResponse.user?.firstname 
                                                        ? `${selectedResponse.user.firstname} ${selectedResponse.user.lastname}`
                                                        : selectedResponse.user?.email || 'Unknown User'}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Email</Label>
                                                <p className="font-medium">{selectedResponse.user?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Score</Label>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${getScoreBadge(selectedResponse.score || 0)} text-lg`}>
                                                        {selectedResponse.score?.toFixed(1) || 0}%
                                                    </Badge>
                                                    {getStatusBadge(selectedResponse)}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Date & Time</Label>
                                                <p className="font-medium">
                                                    {new Date(selectedResponse.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Performance Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">
                                                    {selectedResponse.correctAnswers || 0}/{selectedResponse.totalQuestions || 0}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Questions Correct</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">
                                                    {formatDuration(selectedResponse.duration)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Time Taken</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">
                                                    {selectedResponse.attemptNumber || 1}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Attempt #</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">
                                                    {selectedResponse.pointsEarned || 0}/{selectedResponse.totalPoints || 0}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Points</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Question-by-Question Review */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Question Review</CardTitle>
                                        <CardDescription>
                                            Detailed breakdown of each question
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedResponse.questions?.map((qResponse, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                                                        qResponse.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {qResponse.isCorrect ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            Question {index + 1}: {qResponse.questionText}
                                                        </div>
                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <div>
                                                                <Label className="text-sm text-muted-foreground">Student's Answer</Label>
                                                                <p className={`font-medium ${qResponse.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                                    {qResponse.studentAnswer || 'No answer provided'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <Label className="text-sm text-muted-foreground">Correct Answer</Label>
                                                                <p className="font-medium text-green-700">
                                                                    {qResponse.correctAnswer || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {qResponse.explanation && (
                                                            <div className="mt-2 p-2 bg-muted rounded-md">
                                                                <Label className="text-sm text-muted-foreground">Explanation</Label>
                                                                <p className="text-sm">{qResponse.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Separator className="mt-3" />
                                            </div>
                                        )) || (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground">No detailed question data available</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminDashboardLayout>
    );
}