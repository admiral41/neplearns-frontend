"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Plus,
    Edit,
    Trash2,
    Copy,
    ArrowLeft,
    Save,
    Hash,
    FileText,
    Radio,
    CheckSquare,
    Type,
    Award,
    Eye,
    EyeOff,
    Filter,
    Search,
    RefreshCw,
    AlertTriangle,
    BarChart3,
    GripVertical,
    HelpCircle,
    CheckCircle,
    XCircle,
    ChevronUp,
    ChevronDown,
    MoreVertical,
    Sparkles,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// API services
import { quizAPI } from "@/lib/api/quizzes";
import { questionAPI } from "@/lib/api/questions";

export default function QuizQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId;

    // State
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Question form
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    
    // Filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    
    // Question form data
    const [formData, setFormData] = useState({
        question: "",
        question_type: "single",
        options: [],
        correct_answers: [],
        incorrect_answers: [],
        points: 1,
        isActive: true,
        explanation: "",
    });

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        single: 0,
        multiple: 0,
        totalPoints: 0,
    });

    // Tags input state (for your existing TagsInput component)
    const [correctAnswerTags, setCorrectAnswerTags] = useState([]);
    const [incorrectAnswerTags, setIncorrectAnswerTags] = useState([]);

    // Fetch quiz and questions
    useEffect(() => {
        if (quizId) {
            fetchQuiz();
            fetchQuestions();
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

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const response = await questionAPI.getQuestionsByQuiz(quizId);
            setQuestions(response.data || []);
            calculateStats(response.data || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Failed to load questions');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (questionsList) => {
        const statsData = {
            total: questionsList.length,
            single: questionsList.filter(q => q.question_type === 'single').length,
            multiple: questionsList.filter(q => q.question_type === 'multiple').length,
            totalPoints: questionsList.reduce((sum, q) => sum + (q.points || 1), 0),
        };
        setStats(statsData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCorrectAnswerTags = (tags) => {
        setCorrectAnswerTags(tags);
        setFormData(prev => ({
            ...prev,
            correct_answers: tags
        }));
    };

    const handleIncorrectAnswerTags = (tags) => {
        setIncorrectAnswerTags(tags);
        setFormData(prev => ({
            ...prev,
            incorrect_answers: tags
        }));
    };

    const resetForm = () => {
        setFormData({
            question: "",
            question_type: "single",
            options: [],
            correct_answers: [],
            incorrect_answers: [],
            points: 1,
            isActive: true,
            explanation: "",
        });
        setCorrectAnswerTags([]);
        setIncorrectAnswerTags([]);
        setIsEditing(false);
        setEditingQuestion(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEditDialog = (question) => {
        // Convert your existing question data to form format
        const correctAnswers = question.correct_answers || [];
        const incorrectAnswers = question.incorrect_answers || [];
        
        setFormData({
            question: question.question,
            question_type: question.question_type || "single",
            options: question.options || [],
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
            points: question.points || 1,
            isActive: question.isActive !== false,
            explanation: question.explanation || "",
        });
        
        setCorrectAnswerTags(Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers].filter(Boolean));
        setIncorrectAnswerTags(Array.isArray(incorrectAnswers) ? incorrectAnswers : [incorrectAnswers].filter(Boolean));
        
        setEditingQuestion(question);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const validateForm = () => {
        if (!formData.question.trim()) {
            toast.error("Question text is required");
            return false;
        }

        if (formData.question_type === "single" || formData.question_type === "multiple") {
            if (correctAnswerTags.length === 0) {
                toast.error("Please add at least one correct answer");
                return false;
            }
            if (incorrectAnswerTags.length === 0) {
                toast.error("Please add at least one incorrect answer");
                return false;
            }
        }

        if (formData.points < 1) {
            toast.error("Points must be at least 1");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const questionData = {
                quiz: quizId,
                question: formData.question.trim(),
                question_type: formData.question_type,
                correct_answers: correctAnswerTags,
                incorrect_answers: incorrectAnswerTags,
                points: parseInt(formData.points),
                explanation: formData.explanation.trim(),
                isActive: formData.isActive,
            };

            if (isEditing && editingQuestion) {
                await questionAPI.updateQuestion(editingQuestion._id, questionData);
                toast.success("Question updated successfully!");
            } else {
                await questionAPI.createQuestion(questionData);
                toast.success("Question added successfully!");
            }

            setIsDialogOpen(false);
            resetForm();
            fetchQuestions();
            fetchQuiz(); // Refresh quiz to update total points
        } catch (error) {
            console.error('Error saving question:', error);
            toast.error(error.response?.data?.message || 'Failed to save question');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!questionToDelete) return;

        try {
            await questionAPI.deleteQuestion(questionToDelete._id);
            toast.success("Question deleted successfully!");
            fetchQuestions();
            fetchQuiz(); // Refresh quiz to update total points
        } catch (error) {
            console.error('Error deleting question:', error);
            toast.error('Failed to delete question');
        } finally {
            setQuestionToDelete(null);
        }
    };

    const handleDuplicateQuestion = async (question) => {
        try {
            const questionData = {
                quiz: quizId,
                question: `${question.question} (Copy)`,
                question_type: question.question_type,
                correct_answers: question.correct_answers,
                incorrect_answers: question.incorrect_answers,
                points: question.points,
                explanation: question.explanation,
                isActive: question.isActive,
            };

            await questionAPI.createQuestion(questionData);
            toast.success("Question duplicated!");
            fetchQuestions();
        } catch (error) {
            console.error('Error duplicating question:', error);
            toast.error('Failed to duplicate question');
        }
    };

    const handleReorder = async (result) => {
        if (!result.destination) return;

        const items = Array.from(questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setQuestions(items);

        // Update order in backend
        const questionOrder = items.map((q, index) => q._id);
        try {
            await questionAPI.reorderQuestions(quizId, { questionOrder });
            toast.success("Questions reordered!");
        } catch (error) {
            console.error('Error reordering questions:', error);
            toast.error('Failed to reorder questions');
        }
    };

    const handleToggleStatus = async (question) => {
        try {
            await questionAPI.toggleQuestionStatus(question._id, !question.isActive);
            toast.success(`Question ${question.isActive ? 'deactivated' : 'activated'}!`);
            fetchQuestions();
        } catch (error) {
            console.error('Error toggling question status:', error);
            toast.error('Failed to update question');
        }
    };

    const getQuestionTypeIcon = (type) => {
        switch (type) {
            case 'single': return <Radio className="h-4 w-4" />;
            case 'multiple': return <CheckSquare className="h-4 w-4" />;
            default: return <HelpCircle className="h-4 w-4" />;
        }
    };

    const getQuestionTypeLabel = (type) => {
        switch (type) {
            case 'single': return "Single Choice";
            case 'multiple': return "Multiple Choice";
            default: return type;
        }
    };

    const getCorrectAnswersPreview = (question) => {
        if (question.correct_answers) {
            if (Array.isArray(question.correct_answers)) {
                return question.correct_answers.slice(0, 2).map((ans, i) => (
                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-1">
                        {ans.length > 15 ? `${ans.substring(0, 15)}...` : ans}
                    </Badge>
                ));
            }
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {question.correct_answers.length > 15 ? `${question.correct_answers.substring(0, 15)}...` : question.correct_answers}
                </Badge>
            );
        }
        return null;
    };

    const filteredQuestions = questions.filter(q => {
        // Search filter
        if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        // Type filter
        if (filterType !== 'all' && q.question_type !== filterType) {
            return false;
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
                            <p className="text-muted-foreground">Loading questions...</p>
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
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                                onClick={() => router.push('/admin-dashboard/quizzes')}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Quizzes
                            </Button>
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold">Manage Questions</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{quiz.title || quiz.week?.title}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="gap-1">
                                <Hash className="h-3 w-3" />
                                {stats.total} questions
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Award className="h-3 w-3" />
                                {stats.totalPoints} total points
                            </Badge>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchQuestions}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Question
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {isEditing ? "Edit Question" : "Add New Question"}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6 py-4">
                                    <Tabs defaultValue="basic" className="w-full">
                                        <TabsList className="grid grid-cols-2">
                                            <TabsTrigger value="basic">Question</TabsTrigger>
                                            <TabsTrigger value="settings">Settings</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="basic" className="space-y-4">
                                            {/* Question Type */}
                                            <div className="space-y-2">
                                                <Label>Question Type</Label>
                                                <Select
                                                    value={formData.question_type}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, question_type: value }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select question type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">
                                                            <div className="flex items-center gap-2">
                                                                <Radio className="h-4 w-4" />
                                                                Single Choice
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="multiple">
                                                            <div className="flex items-center gap-2">
                                                                <CheckSquare className="h-4 w-4" />
                                                                Multiple Choice
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Question Text */}
                                            <div className="space-y-2">
                                                <Label>Question Text *</Label>
                                                <Textarea
                                                    name="question"
                                                    placeholder="Enter your question here..."
                                                    value={formData.question}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="min-h-[100px]"
                                                />
                                            </div>

                                            {/* Incorrect Answers (Tags Input) */}
                                            <div className="space-y-2">
                                                <Label>
                                                    Incorrect Answers (Press Enter after each answer) *
                                                </Label>
                                                <div className="border rounded-md p-2 min-h-[80px]">
                                                    {incorrectAnswerTags.map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="mr-2 mb-2"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    <Input
                                                        placeholder="Type an answer and press Enter"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                                e.preventDefault();
                                                                const newTag = e.target.value.trim();
                                                                if (!incorrectAnswerTags.includes(newTag)) {
                                                                    setIncorrectAnswerTags([...incorrectAnswerTags, newTag]);
                                                                }
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Add all possible incorrect answers
                                                </p>
                                            </div>

                                            {/* Correct Answers (Tags Input) */}
                                            <div className="space-y-2">
                                                <Label>
                                                    Correct {formData.question_type === 'single' ? 'Answer' : 'Answers'} (Press Enter after each answer) *
                                                </Label>
                                                <div className="border rounded-md p-2 min-h-[80px] bg-green-50">
                                                    {correctAnswerTags.map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                            className="mr-2 mb-2 bg-green-100 text-green-800 border-green-200"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    <Input
                                                        placeholder="Type correct answer and press Enter"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                                e.preventDefault();
                                                                const newTag = e.target.value.trim();
                                                                if (!correctAnswerTags.includes(newTag)) {
                                                                    if (formData.question_type === 'single' && correctAnswerTags.length > 0) {
                                                                        // For single choice, replace existing answer
                                                                        setCorrectAnswerTags([newTag]);
                                                                    } else {
                                                                        setCorrectAnswerTags([...correctAnswerTags, newTag]);
                                                                    }
                                                                }
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                                    />
                                                </div>
                                                {formData.question_type === 'single' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Single choice questions can have only one correct answer
                                                    </p>
                                                )}
                                            </div>

                                            {/* Explanation */}
                                            <div className="space-y-2">
                                                <Label>Explanation (Optional)</Label>
                                                <Textarea
                                                    name="explanation"
                                                    placeholder="Explain why this is the correct answer..."
                                                    value={formData.explanation}
                                                    onChange={handleInputChange}
                                                    rows={2}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    This will be shown to students after they complete the quiz
                                                </p>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="settings" className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Points</Label>
                                                    <Input
                                                        name="points"
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={formData.points}
                                                        onChange={handleInputChange}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Weight of this question in the total score
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Active</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Include this question in the quiz
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.isActive}
                                                    onCheckedChange={(checked) =>
                                                        setFormData(prev => ({ ...prev, isActive: checked }))
                                                    }
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {isEditing ? "Update Question" : "Add Question"}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Questions</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Hash className="h-5 w-5 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Single Choice</p>
                                    <p className="text-2xl font-bold">{stats.single}</p>
                                </div>
                                <Radio className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Multiple Choice</p>
                                    <p className="text-2xl font-bold">{stats.multiple}</p>
                                </div>
                                <CheckSquare className="h-5 w-5 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Points</p>
                                    <p className="text-2xl font-bold">{stats.totalPoints}</p>
                                </div>
                                <Award className="h-5 w-5 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Questions Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="relative w-full md:w-auto md:min-w-[300px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search questions..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-[150px]">
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="single">Single Choice</SelectItem>
                                            <SelectItem value="multiple">Multiple Choice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {questions.length === 0 ? (
                            <div className="text-center py-12">
                                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Add questions to create your quiz
                                </p>
                                <Button onClick={openCreateDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Question
                                </Button>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No matching questions</h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleReorder}>
                                <Droppable droppableId="questions">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps}>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                        <TableHead className="w-[50px]">#</TableHead>
                                                        <TableHead>Question</TableHead>
                                                        <TableHead className="w-[120px]">Type</TableHead>
                                                        <TableHead className="w-[150px]">Correct Answers</TableHead>
                                                        <TableHead className="w-[80px]">Points</TableHead>
                                                        <TableHead className="w-[80px]">Status</TableHead>
                                                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredQuestions.map((question, index) => (
                                                        <Draggable key={question._id} draggableId={question._id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <TableRow
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`hover:bg-muted/50 ${snapshot.isDragging ? 'bg-muted' : ''}`}
                                                                >
                                                                    <TableCell>
                                                                        <div {...provided.dragHandleProps}>
                                                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="font-mono">{index + 1}</div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="space-y-1">
                                                                            <div className="font-medium line-clamp-2">
                                                                                {question.question}
                                                                            </div>
                                                                            {question.explanation && (
                                                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                                                    {question.explanation}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            {getQuestionTypeIcon(question.question_type)}
                                                                            <span className="text-sm">
                                                                                {getQuestionTypeLabel(question.question_type)}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {getCorrectAnswersPreview(question)}
                                                                            {question.correct_answers && 
                                                                                Array.isArray(question.correct_answers) && 
                                                                                question.correct_answers.length > 2 && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    +{question.correct_answers.length - 2} more
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">
                                                                            {question.points || 1} pt{(question.points || 1) !== 1 ? 's' : ''}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {question.isActive !== false ? (
                                                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                                Active
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                                                                                <EyeOff className="h-3 w-3 mr-1" />
                                                                                Hidden
                                                                            </Badge>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex justify-end gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => openEditDialog(question)}
                                                                                title="Edit"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => handleDuplicateQuestion(question)}
                                                                                title="Duplicate"
                                                                            >
                                                                                <Copy className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={() => handleToggleStatus(question)}
                                                                                title={question.isActive !== false ? "Deactivate" : "Activate"}
                                                                            >
                                                                                {question.isActive !== false ? (
                                                                                    <EyeOff className="h-4 w-4" />
                                                                                ) : (
                                                                                    <Eye className="h-4 w-4" />
                                                                                )}
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                onClick={() => setQuestionToDelete(question)}
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}

                        {questions.length > 0 && (
                            <div className="p-4 border-t flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    Showing {filteredQuestions.length} of {questions.length} questions
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/quiz/${quizId}/preview`, '_blank')}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview Quiz
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/admin-dashboard/quizzes/${quizId}/results`)}
                                    >
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        View Results
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!questionToDelete} onOpenChange={() => setQuestionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this question? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminDashboardLayout>
    );
}