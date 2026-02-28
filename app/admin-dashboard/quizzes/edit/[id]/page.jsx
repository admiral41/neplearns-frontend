"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // Changed from next/router
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Clock,
    CheckCircle,
    Loader2,
    Copy,
    Eye,
    BookOpen,
    BarChart3,
    Shuffle,
    Timer,
    Users,
    Award,
    HelpCircle,
    ChevronRight,
    ChevronLeft,
    Upload,
    FileText,
    Save,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { quizAPI } from "@/lib/api/quizzes";
import { courseAPI } from "@/lib/api/courses";
import { weekAPI } from "@/lib/api/weeks";
import { lessonAPI } from "@/lib/api/lessons";
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

export default function EditQuizPage() { // Removed params from props
    const router = useRouter();
    const params = useParams(); // Use useParams hook instead
    const id = params?.id; // Get quiz ID from params
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [activeTab, setActiveTab] = useState("basic");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [courses, setCourses] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [originalQuestions, setOriginalQuestions] = useState([]);
    const [quizData, setQuizData] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Basic Information
        title: "",
        description: "",
        instructions: "",
        course: "",
        week: "",
        lesson: "",

        // Timing & Attempts
        duration: 30,
        maxAttempts: 1,
        passingScore: 50,
        startDate: "",
        endDate: "",
        isTimed: false,

        // Settings
        isPublished: false,
        showResults: true,
        shuffleQuestions: false,
        shuffleOptions: false,
    });

    // Questions state
    const [questionForm, setQuestionForm] = useState({
        questionText: "",
        questionType: "single_choice",
        options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
        correctAnswers: [],
        explanation: "",
        points: 1,
        difficulty: "medium",
        tags: [],
    });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);

    // Check if we have an ID
    useEffect(() => {
        if (!id) {
            toast.error("No quiz ID provided");
            router.push('/admin-dashboard/quizzes');
            return;
        }
    }, [id, router]);

    // Fetch data on component mount
    useEffect(() => {
        if (!id) return;
        
        fetchCourses();
        fetchQuizData();
    }, [id]);

    const fetchQuizData = async () => {
        try {
            if (!id) return;
            
            setIsLoading(true);
            // Fetch quiz data
            const quizResponse = await quizAPI.getQuiz(id, { 
                includeQuestions: 'true',
                withAnswers: 'true'
            });
            
            if (!quizResponse.success) {
                throw new Error(quizResponse.msg || 'Failed to fetch quiz data');
            }

            const quiz = quizResponse.data;
            setQuizData(quiz);
            
            // Set form data
            setFormData({
                title: quiz.title || "",
                description: quiz.description || "",
                instructions: quiz.instructions || "",
                course: quiz.course?._id || quiz.course || "",
                week: quiz.week?._id || quiz.week || "",
                lesson: quiz.lesson?._id || quiz.lesson || "",
                duration: quiz.duration || 30,
                maxAttempts: quiz.maxAttempts || 1,
                passingScore: quiz.passingScore || 50,
                startDate: quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : "",
                endDate: quiz.endDate ? new Date(quiz.endDate).toISOString().slice(0, 16) : "",
                isTimed: quiz.isTimed || false,
                isPublished: quiz.isPublished || false,
                showResults: quiz.showResults !== false, // Default to true
                shuffleQuestions: quiz.shuffleQuestions || false,
                shuffleOptions: quiz.shuffleOptions || false,
            });

            // Fetch weeks for the selected course
            if (quiz.course?._id || quiz.course) {
                await fetchWeeks(quiz.course._id || quiz.course);
            }

            // Fetch lessons for the selected week
            if (quiz.week?._id || quiz.week) {
                await fetchLessons(quiz.week._id || quiz.week);
            }

            // Set questions if they exist
            if (quiz.questions && Array.isArray(quiz.questions)) {
                const formattedQuestions = quiz.questions.map((q, index) => ({
                    ...q,
                    order: index,
                    // Ensure options and correctAnswers are properly formatted
                    options: q.options || [],
                    correctAnswers: q.correctAnswers || [],
                    id: q._id || `question-${index}`,
                }));
                setQuestions(formattedQuestions);
                setOriginalQuestions(JSON.parse(JSON.stringify(formattedQuestions)));
            }

            // Fetch questions separately if not included
            if (!quiz.questions || quiz.questions.length === 0) {
                const questionsResponse = await quizAPI.getQuizQuestions(id, { withAnswers: 'true' });
                if (questionsResponse.success && questionsResponse.data) {
                    const formattedQuestions = questionsResponse.data.map((q, index) => ({
                        ...q,
                        order: index,
                        options: q.options || [],
                        correctAnswers: q.correctAnswers || [],
                        id: q._id || `question-${index}`,
                    }));
                    setQuestions(formattedQuestions);
                    setOriginalQuestions(JSON.parse(JSON.stringify(formattedQuestions)));
                }
            }

        } catch (error) {
            console.error('Error fetching quiz data:', error);
            toast.error(error.message || 'Failed to load quiz data');
            router.push('/admin-dashboard/quizzes');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            setIsLoadingCourses(true);
            const response = await courseAPI.getAllCourses({
                status: 'published',
                page: 1,
                limit: 100
            });
            
            if (response && response.data) {
                setCourses(response.data);
            } else if (Array.isArray(response)) {
                setCourses(response);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
            setCourses([]);
        } finally {
            setIsLoadingCourses(false);
        }
    };

    const fetchWeeks = async (courseId) => {
        if (!courseId) {
            setWeeks([]);
            setLessons([]);
            setFormData(prev => ({ ...prev, week: "", lesson: "" }));
            return;
        }

        try {
            const response = await weekAPI.getWeeksByCourse(courseId);
            
            if (response && response.data) {
                setWeeks(response.data);
            } else if (Array.isArray(response)) {
                setWeeks(response);
            } else {
                setWeeks([]);
            }
            
        } catch (error) {
            console.error('Error fetching weeks:', error);
            toast.error('Failed to load weeks');
            setWeeks([]);
        }
    };

    const fetchLessons = async (weekId) => {
        if (!weekId) {
            setLessons([]);
            return;
        }

        try {
            const response = await lessonAPI.getLessonsByWeek(weekId);
            
            if (response && response.data) {
                setLessons(response.data);
            } else if (Array.isArray(response)) {
                setLessons(response);
            } else {
                setLessons([]);
            }
            
        } catch (error) {
            console.error('Error fetching lessons:', error);
            toast.error('Failed to load lessons');
            setLessons([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }));
        checkForChanges();
    };

    const handleSelectChange = async (name, value) => {
        // Convert "none" to empty string for backend
        const backendValue = value === "none" ? "" : value;

        setFormData(prev => ({
            ...prev,
            [name]: backendValue
        }));

        // Fetch related data
        if (name === 'course') {
            await fetchWeeks(backendValue);
            // Clear week and lesson when course changes
            setFormData(prev => ({ ...prev, week: "", lesson: "" }));
            setLessons([]);
        } else if (name === 'week') {
            await fetchLessons(backendValue);
            // Clear lesson when week changes
            setFormData(prev => ({ ...prev, lesson: "" }));
        }

        checkForChanges();
    };

    const handleSwitchChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
        checkForChanges();
    };

    const handleDateTimeChange = (name, value) => {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        checkForChanges();
    };

    // Question Management
    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setQuestionForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...questionForm.options];
        if (field === 'isCorrect') {
            // For single choice, only one option can be correct
            if (questionForm.questionType === 'single_choice') {
                newOptions.forEach(opt => opt.isCorrect = false);
            }
            newOptions[index][field] = value;

            // Update correctAnswers array for text-based correct answers
            const correctAnswers = newOptions
                .filter(opt => opt.isCorrect)
                .map(opt => opt.text);
            setQuestionForm(prev => ({ ...prev, options: newOptions, correctAnswers }));
        } else {
            newOptions[index][field] = value;
            setQuestionForm(prev => ({ ...prev, options: newOptions }));
        }
    };

    const addOption = () => {
        setQuestionForm(prev => ({
            ...prev,
            options: [...prev.options, { text: "", isCorrect: false }]
        }));
    };

    const removeOption = (index) => {
        if (questionForm.options.length <= 2) {
            toast.error("Questions must have at least 2 options");
            return;
        }

        const newOptions = questionForm.options.filter((_, i) => i !== index);
        setQuestionForm(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const handleQuestionTypeChange = (type) => {
        // Reset options based on question type
        let newOptions = [];
        let correctAnswers = [];

        if (type === 'true_false') {
            newOptions = [
                { text: "True", isCorrect: false },
                { text: "False", isCorrect: false }
            ];
        } else if (type === 'single_choice' || type === 'multiple_choice') {
            newOptions = [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ];
        } else if (type === 'short_answer' || type === 'essay') {
            newOptions = [];
            correctAnswers = [""];
        }

        setQuestionForm(prev => ({
            ...prev,
            questionType: type,
            options: newOptions,
            correctAnswers: correctAnswers
        }));
    };

    const saveQuestion = () => {
        // Validate question
        if (!questionForm.questionText.trim()) {
            toast.error("Question text is required");
            return;
        }

        if (questionForm.questionType === 'single_choice' ||
            questionForm.questionType === 'multiple_choice' ||
            questionForm.questionType === 'true_false') {

            // Check for empty options
            const emptyOptions = questionForm.options.filter(opt => !opt.text.trim());
            if (emptyOptions.length > 0) {
                toast.error("All options must have text");
                return;
            }

            // Check for duplicate options
            const optionTexts = questionForm.options.map(opt => opt.text.toLowerCase().trim());
            const uniqueTexts = new Set(optionTexts);
            if (optionTexts.length !== uniqueTexts.size) {
                toast.error("Options must be unique");
                return;
            }

            // Check for correct answers
            const hasCorrectAnswer = questionForm.options.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
                toast.error("At least one correct answer is required");
                return;
            }

            // For single choice, only one should be correct
            if (questionForm.questionType === 'single_choice') {
                const correctCount = questionForm.options.filter(opt => opt.isCorrect).length;
                if (correctCount !== 1) {
                    toast.error("Single choice questions must have exactly one correct answer");
                    return;
                }
            }
        }

        if (questionForm.questionType === 'short_answer' ||
            questionForm.questionType === 'essay') {
            if (!questionForm.correctAnswers || questionForm.correctAnswers.length === 0 || 
                !questionForm.correctAnswers[0]?.trim()) {
                toast.error("Correct answer(s) are required");
                return;
            }
        }

        if (questionForm.points <= 0) {
            toast.error("Points must be greater than 0");
            return;
        }

        // Prepare question data
        const newQuestion = {
            questionText: questionForm.questionText.trim(),
            questionType: questionForm.questionType,
            points: questionForm.points,
            difficulty: questionForm.difficulty,
            explanation: questionForm.explanation?.trim() || "",
            tags: questionForm.tags,
            order: isEditingQuestion ? questions[currentQuestionIndex].order : questions.length
        };

        // Add options and correct answers based on question type
        if (questionForm.questionType === 'single_choice' || 
            questionForm.questionType === 'multiple_choice' || 
            questionForm.questionType === 'true_false') {
            newQuestion.options = questionForm.options.map(opt => ({
                text: opt.text.trim(),
                isCorrect: opt.isCorrect
            }));
            
            newQuestion.correctAnswers = questionForm.options
                .filter(opt => opt.isCorrect)
                .map(opt => opt.text.trim());
        } else if (questionForm.questionType === 'short_answer' || 
                   questionForm.questionType === 'essay') {
            newQuestion.correctAnswers = questionForm.correctAnswers
                .filter(answer => answer.trim())
                .map(answer => answer.trim());
        }

        // Add to questions array
        if (isEditingQuestion) {
            const updatedQuestions = [...questions];
            updatedQuestions[currentQuestionIndex] = newQuestion;
            setQuestions(updatedQuestions);
            toast.success("Question updated successfully");
        } else {
            setQuestions([...questions, newQuestion]);
            toast.success("Question added successfully");
        }

        // Reset question form
        resetQuestionForm();
        setIsEditingQuestion(false);
        setCurrentQuestionIndex(null);
        checkForChanges();
    };

    const editQuestion = (index) => {
        const question = questions[index];
        setQuestionForm({
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options || [],
            correctAnswers: question.correctAnswers || [],
            explanation: question.explanation || "",
            points: question.points,
            difficulty: question.difficulty,
            tags: question.tags || []
        });
        setCurrentQuestionIndex(index);
        setIsEditingQuestion(true);
        setActiveTab("questions");
    };

    const deleteQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        // Reorder questions
        const reorderedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            order: idx
        }));
        setQuestions(reorderedQuestions);
        toast.success("Question deleted");
        checkForChanges();
    };

    const resetQuestionForm = () => {
        setQuestionForm({
            questionText: "",
            questionType: "single_choice",
            options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
            correctAnswers: [],
            explanation: "",
            points: 1,
            difficulty: "medium",
            tags: [],
        });
    };

    const reorderQuestion = (index, direction) => {
        if ((direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)) {
            return;
        }

        const newQuestions = [...questions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap orders
        const tempOrder = newQuestions[index].order;
        newQuestions[index].order = newQuestions[newIndex].order;
        newQuestions[newIndex].order = tempOrder;

        // Swap positions
        [newQuestions[index], newQuestions[newIndex]] =
            [newQuestions[newIndex], newQuestions[index]];

        setQuestions(newQuestions);
        checkForChanges();
    };

    const checkForChanges = () => {
        if (!quizData) return;

        // Simple comparison - in production, you might want a more robust comparison
        const formChanged = JSON.stringify(formData) !== JSON.stringify({
            title: quizData?.title || "",
            description: quizData?.description || "",
            instructions: quizData?.instructions || "",
            course: quizData?.course?._id || quizData?.course || "",
            week: quizData?.week?._id || quizData?.week || "",
            lesson: quizData?.lesson?._id || quizData?.lesson || "",
            duration: quizData?.duration || 30,
            maxAttempts: quizData?.maxAttempts || 1,
            passingScore: quizData?.passingScore || 50,
            startDate: quizData?.startDate ? new Date(quizData.startDate).toISOString().slice(0, 16) : "",
            endDate: quizData?.endDate ? new Date(quizData.endDate).toISOString().slice(0, 16) : "",
            isTimed: quizData?.isTimed || false,
            isPublished: quizData?.isPublished || false,
            showResults: quizData?.showResults !== false,
            shuffleQuestions: quizData?.shuffleQuestions || false,
            shuffleOptions: quizData?.shuffleOptions || false,
        });

        const questionsChanged = JSON.stringify(questions) !== JSON.stringify(originalQuestions);
        
        setHasChanges(formChanged || questionsChanged);
    };

    // Form Validation
    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error("Quiz title is required");
            return false;
        }

        if (!formData.course) {
            toast.error("Please select a course");
            return false;
        }

        if (formData.duration <= 0) {
            toast.error("Duration must be greater than 0 minutes");
            return false;
        }

        if (formData.maxAttempts < 1) {
            toast.error("Maximum attempts must be at least 1");
            return false;
        }

        if (formData.passingScore < 0 || formData.passingScore > 100) {
            toast.error("Passing score must be between 0 and 100");
            return false;
        }

        if (formData.startDate && formData.endDate &&
            new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error("End date must be after start date");
            return false;
        }

        if (questions.length === 0) {
            toast.error("At least one question is required");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!id) {
            toast.error("No quiz ID found");
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            // Prepare quiz data for update
            const updateData = {
                title: formData.title.trim(),
                description: formData.description?.trim() || "",
                instructions: formData.instructions?.trim() || "",
                course: formData.course,
                week: formData.week || null,
                lesson: formData.lesson || null,
                duration: formData.duration,
                maxAttempts: formData.maxAttempts,
                passingScore: formData.passingScore,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                isTimed: formData.isTimed,
                isPublished: formData.isPublished,
                showResults: formData.showResults,
                shuffleQuestions: formData.shuffleQuestions,
                shuffleOptions: formData.shuffleOptions,
            };

            // Step 1: Update the quiz
            const updateResponse = await quizAPI.updateQuiz(id, updateData);

            if (!updateResponse.success) {
                throw new Error(updateResponse.msg || 'Failed to update quiz');
            }

            // Step 2: Handle questions
            // For simplicity, we'll delete all existing questions and add new ones
            // In production, you might want a more sophisticated approach
            if (questions.length > 0) {
                // Get existing questions to delete
                const existingQuestionsResponse = await quizAPI.getQuizQuestions(id);
                if (existingQuestionsResponse.success && existingQuestionsResponse.data) {
                    const existingQuestionIds = existingQuestionsResponse.data
                        .filter(q => q._id)
                        .map(q => q._id);
                    
                    // Delete existing questions
                    if (existingQuestionIds.length > 0) {
                        await quizAPI.bulkDeleteQuestions(existingQuestionIds);
                    }
                }

                // Add new questions
                let createdQuestions = 0;
                for (const [index, question] of questions.entries()) {
                    try {
                        const questionData = {
                            questionText: question.questionText,
                            questionType: question.questionType,
                            points: question.points,
                            difficulty: question.difficulty,
                            explanation: question.explanation,
                            tags: question.tags,
                            order: index,
                            ...(question.options && { options: question.options }),
                            ...(question.correctAnswers && { correctAnswers: question.correctAnswers })
                        };

                        const questionResponse = await quizAPI.addQuestion(id, questionData);
                        
                        if (questionResponse.success) {
                            createdQuestions++;
                        } else {
                            console.warn(`Failed to add question ${index + 1}:`, questionResponse.msg);
                        }
                    } catch (error) {
                        console.error(`Error adding question ${index + 1}:`, error);
                        // Continue with other questions even if one fails
                    }
                }

            }

            toast.success(`Quiz updated successfully!`);
            
            // Update original questions to reflect changes
            setOriginalQuestions(JSON.parse(JSON.stringify(questions)));
            setHasChanges(false);

            // Refresh quiz data
            await fetchQuizData();

        } catch (error) {
            console.error('Error updating quiz:', error);
            toast.error(error.response?.data?.msg || error.message || 'Failed to update quiz');
        } finally {
            setIsSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    const handleResetChanges = () => {
        // Reset form to original data
        if (quizData) {
            setFormData({
                title: quizData.title || "",
                description: quizData.description || "",
                instructions: quizData.instructions || "",
                course: quizData.course?._id || quizData.course || "",
                week: quizData.week?._id || quizData.week || "",
                lesson: quizData.lesson?._id || quizData.lesson || "",
                duration: quizData.duration || 30,
                maxAttempts: quizData.maxAttempts || 1,
                passingScore: quizData.passingScore || 50,
                startDate: quizData.startDate ? new Date(quizData.startDate).toISOString().slice(0, 16) : "",
                endDate: quizData.endDate ? new Date(quizData.endDate).toISOString().slice(0, 16) : "",
                isTimed: quizData.isTimed || false,
                isPublished: quizData.isPublished || false,
                showResults: quizData.showResults !== false,
                shuffleQuestions: quizData.shuffleQuestions || false,
                shuffleOptions: quizData.shuffleOptions || false,
            });

            // Reset questions
            setQuestions(JSON.parse(JSON.stringify(originalQuestions)));
            
            setHasChanges(false);
            toast.success("Changes reset");
        }
    };

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Get display value for selects (convert empty string to "none" for display)
    const getDisplayValue = (value) => value === "" ? "none" : value;

    // Get selected course
    const selectedCourse = courses.find(c => c._id === formData.course);
    const selectedWeek = weeks.find(w => w._id === formData.week);
    const selectedLesson = lessons.find(l => l._id === formData.lesson);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!id) {
        return (
            <AdminDashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-lg sm:text-xl font-bold mb-2">No Quiz ID Provided</h2>
                    <Link href="/admin-dashboard/quizzes">
                        <Button>Back to Quizzes</Button>
                    </Link>
                </div>
            </AdminDashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <AdminDashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                        <p className="text-lg">Loading quiz data...</p>
                    </div>
                </div>
            </AdminDashboardLayout>
        );
    }

    if (!quizData) {
        return (
            <AdminDashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-lg sm:text-xl font-bold mb-2">Quiz Not Found</h2>
                    <p className="text-muted-foreground mb-6">The quiz you're trying to edit doesn't exist.</p>
                    <Link href="/admin-dashboard/quizzes">
                        <Button>Back to Quizzes</Button>
                    </Link>
                </div>
            </AdminDashboardLayout>
        );
    }

    return (
        <AdminDashboardLayout>
            <div className="px-4 py-6 sm:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin-dashboard/quizzes">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold">Edit Quiz</h1>
                            <p className="text-sm text-muted-foreground">
                                Editing: {formData.title}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {hasChanges && (
                            <Button
                                variant="outline"
                                onClick={handleResetChanges}
                                disabled={isSubmitting}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset Changes
                            </Button>
                        )}
                        <Button
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={isSubmitting || !hasChanges}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Quiz Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Navigation Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3">
                                <TabsTrigger value="basic">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Basic Info
                                </TabsTrigger>
                                <TabsTrigger value="settings">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Settings
                                </TabsTrigger>
                                <TabsTrigger value="questions">
                                    <HelpCircle className="h-4 w-4 mr-2" />
                                    Questions ({questions.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">
                                                Quiz Title <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                placeholder="e.g., Chapter 1 Assessment, Midterm Exam"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Brief description of the quiz..."
                                                rows={3}
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="instructions">Instructions</Label>
                                            <Textarea
                                                id="instructions"
                                                name="instructions"
                                                placeholder="Instructions for students taking this quiz..."
                                                rows={4}
                                                value={formData.instructions}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="course">
                                                    Course <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={getDisplayValue(formData.course)}
                                                    onValueChange={(value) => handleSelectChange('course', value)}
                                                    disabled={isLoadingCourses}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingCourses ? "Loading..." : "Select course"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none" disabled>
                                                            Select a course
                                                        </SelectItem>
                                                        {courses.map((course) => (
                                                            <SelectItem key={course._id} value={course._id}>
                                                                <div className="flex items-center gap-2">
                                                                    {course.image ? (
                                                                        <img
                                                                            src={course.image}
                                                                            alt={course.courseTitle}
                                                                            className="w-6 h-6 rounded object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                                                            <BookOpen className="h-3 w-3 text-primary" />
                                                                        </div>
                                                                    )}
                                                                    <span className="truncate">{course.courseTitle}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="week">Week (Optional)</Label>
                                                <Select
                                                    value={getDisplayValue(formData.week)}
                                                    onValueChange={(value) => handleSelectChange('week', value)}
                                                    disabled={!formData.course || weeks.length === 0}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={!formData.course ? "Select course first" : weeks.length === 0 ? "No weeks available" : "Select week"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            None
                                                        </SelectItem>
                                                        {weeks.map((week) => (
                                                            <SelectItem key={week._id} value={week._id}>
                                                                Week {week.weekNumber}: {week.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="lesson">Lesson (Optional)</Label>
                                                <Select
                                                    value={getDisplayValue(formData.lesson)}
                                                    onValueChange={(value) => handleSelectChange('lesson', value)}
                                                    disabled={!formData.week || lessons.length === 0}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={!formData.week ? "Select week first" : lessons.length === 0 ? "No lessons available" : "Select lesson"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            None
                                                        </SelectItem>
                                                        {lessons.map((lesson) => (
                                                            <SelectItem key={lesson._id} value={lesson._id}>
                                                                {lesson.lessonTitle}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Timing & Availability */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Timing & Availability</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="duration">
                                                    Duration (minutes) <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="duration"
                                                        name="duration"
                                                        type="number"
                                                        min="1"
                                                        placeholder="30"
                                                        className="pl-9"
                                                        value={formData.duration}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="maxAttempts">
                                                    Maximum Attempts <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="maxAttempts"
                                                        name="maxAttempts"
                                                        type="number"
                                                        min="1"
                                                        placeholder="1"
                                                        className="pl-9"
                                                        value={formData.maxAttempts}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="passingScore">
                                                Passing Score (%) <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="passingScore"
                                                    name="passingScore"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="50"
                                                    className="pl-9"
                                                    value={formData.passingScore}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Start Date & Time (Optional)</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={formData.startDate}
                                                    onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>End Date & Time (Optional)</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={formData.endDate}
                                                    onChange={(e) => handleDateTimeChange('endDate', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quiz Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="isTimed">Enable Timer</Label>
                                                        <Timer className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Automatically submit when time expires
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="isTimed"
                                                    checked={formData.isTimed}
                                                    onCheckedChange={(checked) => handleSwitchChange('isTimed', checked)}
                                                />
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                                                        <Shuffle className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Randomize question order for each attempt
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="shuffleQuestions"
                                                    checked={formData.shuffleQuestions}
                                                    onCheckedChange={(checked) => handleSwitchChange('shuffleQuestions', checked)}
                                                />
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                                                        <Shuffle className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Randomize answer options for each attempt
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="shuffleOptions"
                                                    checked={formData.shuffleOptions}
                                                    onCheckedChange={(checked) => handleSwitchChange('shuffleOptions', checked)}
                                                />
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="showResults">Show Results</Label>
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Allow students to view their results after submission
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="showResults"
                                                    checked={formData.showResults}
                                                    onCheckedChange={(checked) => handleSwitchChange('showResults', checked)}
                                                />
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor="isPublished">Published Status</Label>
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Make this quiz available to students
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="isPublished"
                                                    checked={formData.isPublished}
                                                    onCheckedChange={(checked) => handleSwitchChange('isPublished', checked)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Questions Tab */}
                            <TabsContent value="questions" className="space-y-6">
                                {/* Question List */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Questions ({questions.length})</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {totalPoints} Total Points
                                                </Badge>
                                                <Badge variant="outline">
                                                    ~{questions.length * 1} mins
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {questions.length === 0 ? (
                                            <div className="text-center py-8">
                                                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium mb-2">No Questions Added</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Start by adding your first question below
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {questions.map((question, index) => (
                                                    <div
                                                        key={index}
                                                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="secondary">
                                                                    Q{index + 1}
                                                                </Badge>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline">
                                                                        {question.questionType.replace('_', ' ')}
                                                                    </Badge>
                                                                    <Badge variant="outline">
                                                                        {question.points} pt{question.points !== 1 ? 's' : ''}
                                                                    </Badge>
                                                                    <Badge variant="outline">
                                                                        {question.difficulty}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => reorderQuestion(index, 'up')}
                                                                    disabled={index === 0}
                                                                >
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => reorderQuestion(index, 'down')}
                                                                    disabled={index === questions.length - 1}
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => editQuestion(index)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => deleteQuestion(index)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="font-medium mb-2">{question.questionText}</p>
                                                        {question.options && question.options.length > 0 && (
                                                            <div className="space-y-1 ml-4">
                                                                {question.options.map((option, optIndex) => (
                                                                    <div
                                                                        key={optIndex}
                                                                        className={`flex items-center gap-2 ${option.isCorrect ? 'text-green-600' : ''}`}
                                                                    >
                                                                        <div className={`w-2 h-2 rounded-full ${option.isCorrect ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                        <span>{option.text}</span>
                                                                        {option.isCorrect && (
                                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {(question.questionType === 'short_answer' || question.questionType === 'essay') && 
                                                         question.correctAnswers && question.correctAnswers.length > 0 && (
                                                            <div className="mt-2 ml-4">
                                                                <p className="text-sm font-medium">Correct Answer(s):</p>
                                                                {question.correctAnswers.map((answer, idx) => (
                                                                    <p key={idx} className="text-sm text-green-600">{answer}</p>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {question.explanation && (
                                                            <div className="mt-3 pt-3 border-t">
                                                                <p className="text-sm text-muted-foreground">
                                                                    <span className="font-medium">Explanation:</span> {question.explanation}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Add/Edit Question Form */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {isEditingQuestion ? "Edit Question" : "Add New Question"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="questionText">
                                                Question Text <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="questionText"
                                                name="questionText"
                                                placeholder="Enter your question here..."
                                                rows={3}
                                                value={questionForm.questionText}
                                                onChange={handleQuestionChange}
                                                required
                                            />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Question Type</Label>
                                                <Select
                                                    value={questionForm.questionType}
                                                    onValueChange={handleQuestionTypeChange}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single_choice">Single Choice</SelectItem>
                                                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                        <SelectItem value="true_false">True/False</SelectItem>
                                                        <SelectItem value="short_answer">Short Answer</SelectItem>
                                                        <SelectItem value="essay">Essay</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="points">
                                                    Points <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="points"
                                                    name="points"
                                                    type="number"
                                                    min="1"
                                                    value={questionForm.points}
                                                    onChange={handleQuestionChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Difficulty</Label>
                                            <div className="flex gap-2">
                                                {['easy', 'medium', 'hard'].map((level) => (
                                                    <Button
                                                        key={level}
                                                        type="button"
                                                        variant={questionForm.difficulty === level ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setQuestionForm(prev => ({ ...prev, difficulty: level }))}
                                                        className="capitalize"
                                                    >
                                                        {level}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Options for choice-based questions */}
                                        {(questionForm.questionType === 'single_choice' ||
                                            questionForm.questionType === 'multiple_choice' ||
                                            questionForm.questionType === 'true_false') && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Answer Options</Label>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={addOption}
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Add Option
                                                        </Button>
                                                    </div>

                                                    {questionForm.options.map((option, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <Input
                                                                    placeholder={`Option ${index + 1}`}
                                                                    value={option.text}
                                                                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant={option.isCorrect ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => handleOptionChange(index, 'isCorrect', !option.isCorrect)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    {option.isCorrect ? "Correct" : "Mark Correct"}
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeOption(index)}
                                                                    disabled={questionForm.options.length <= 2}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        {/* Correct answers for short answer/essay */}
                                        {(questionForm.questionType === 'short_answer' ||
                                            questionForm.questionType === 'essay') && (
                                                <div className="space-y-2">
                                                    <Label>
                                                        Correct Answer{questionForm.questionType === 'short_answer' ? '' : 's'}
                                                        <span className="text-red-500">*</span>
                                                    </Label>
                                                    {questionForm.questionType === 'short_answer' ? (
                                                        <Input
                                                            placeholder="Enter the correct answer"
                                                            value={questionForm.correctAnswers[0] || ''}
                                                            onChange={(e) => setQuestionForm(prev => ({
                                                                ...prev,
                                                                correctAnswers: [e.target.value]
                                                            }))}
                                                        />
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {questionForm.correctAnswers.map((answer, index) => (
                                                                <div key={index} className="flex gap-2">
                                                                    <Input
                                                                        placeholder={`Acceptable answer ${index + 1}`}
                                                                        value={answer}
                                                                        onChange={(e) => {
                                                                            const newAnswers = [...questionForm.correctAnswers];
                                                                            newAnswers[index] = e.target.value;
                                                                            setQuestionForm(prev => ({
                                                                                ...prev,
                                                                                correctAnswers: newAnswers
                                                                            }));
                                                                        }}
                                                                    />
                                                                    {questionForm.correctAnswers.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const newAnswers = questionForm.correctAnswers.filter((_, i) => i !== index);
                                                                                setQuestionForm(prev => ({
                                                                                    ...prev,
                                                                                    correctAnswers: newAnswers
                                                                                }));
                                                                            }}
                                                                            className="text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setQuestionForm(prev => ({
                                                                    ...prev,
                                                                    correctAnswers: [...prev.correctAnswers, ""]
                                                                }))}
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add Another Answer
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        <div className="space-y-2">
                                            <Label htmlFor="explanation">Explanation (Optional)</Label>
                                            <Textarea
                                                id="explanation"
                                                name="explanation"
                                                placeholder="Explanation for the correct answer..."
                                                rows={2}
                                                value={questionForm.explanation}
                                                onChange={handleQuestionChange}
                                            />
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                type="button"
                                                onClick={saveQuestion}
                                                className="flex-1"
                                            >
                                                {isEditingQuestion ? "Update Question" : "Add Question"}
                                            </Button>
                                            {isEditingQuestion && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        resetQuestionForm();
                                                        setIsEditingQuestion(false);
                                                        setCurrentQuestionIndex(null);
                                                    }}
                                                >
                                                    Cancel Edit
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Preview & Actions */}
                    <div className="space-y-6">
                        {/* Quiz Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-medium text-lg truncate">
                                            {formData.title || "Untitled Quiz"}
                                        </h3>
                                        {formData.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {formData.description}
                                            </p>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Status</span>
                                            <Badge variant={formData.isPublished ? "default" : "secondary"}>
                                                {formData.isPublished ? "Published" : "Draft"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Questions</span>
                                            <span className="font-medium">{questions.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Total Points</span>
                                            <span className="font-medium">{totalPoints}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Duration</span>
                                            <span className="font-medium">{formData.duration} mins</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Passing Score</span>
                                            <span className="font-medium">{formData.passingScore}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Max Attempts</span>
                                            <span className="font-medium">{formData.maxAttempts}</span>
                                        </div>
                                    </div>

                                    {formData.startDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Starts</span>
                                            <span className="text-sm">
                                                {formatDate(formData.startDate)}
                                            </span>
                                        </div>
                                    )}

                                    {formData.endDate && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Ends</span>
                                            <span className="text-sm">
                                                {formatDate(formData.endDate)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Features Summary */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Features</h4>
                                    <div className="space-y-1">
                                        {formData.isTimed && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Timer className="h-4 w-4 text-green-500" />
                                                <span>Timed Quiz</span>
                                            </div>
                                        )}
                                        {formData.shuffleQuestions && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Shuffle className="h-4 w-4 text-green-500" />
                                                <span>Shuffled Questions</span>
                                            </div>
                                        )}
                                        {formData.shuffleOptions && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Shuffle className="h-4 w-4 text-green-500" />
                                                <span>Shuffled Options</span>
                                            </div>
                                        )}
                                        {formData.showResults && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Eye className="h-4 w-4 text-green-500" />
                                                <span>Results Visible</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Info */}
                        {selectedCourse && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        {selectedCourse.image ? (
                                            <img
                                                src={selectedCourse.image}
                                                alt="Course"
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                                                <BookOpen className="h-6 w-6 text-primary" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {selectedCourse.courseTitle}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {selectedWeek && `Week ${selectedWeek.weekNumber}`}
                                                {selectedWeek && selectedLesson && ` • `}
                                                {selectedLesson && `Lesson`}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => router.push(`/admin-dashboard/quizzes/${id}`)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Quiz
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        const quizData = {
                                            ...formData,
                                            title: `${formData.title} (Copy)`,
                                            isPublished: false
                                        };
                                        localStorage.setItem('quiz_clipboard', JSON.stringify(quizData));
                                        localStorage.setItem('quiz_questions_clipboard', JSON.stringify(questions));
                                        toast.success("Quiz copied to clipboard!");
                                    }}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate Quiz
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        if (validateForm()) {
                                            toast.success("Quiz is valid!");
                                        }
                                    }}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Validate Quiz
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Created</span>
                                        <span className="text-sm">
                                            {quizData.createdAt ? new Date(quizData.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Last Updated</span>
                                        <span className="text-sm">
                                            {quizData.updatedAt ? new Date(quizData.updatedAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Created By</span>
                                        <span className="text-sm">
                                            {quizData.postedBy?.firstname || 'Unknown'}
                                        </span>
                                    </div>
                                    {hasChanges && (
                                        <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                                                You have unsaved changes
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Save Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to save these changes?
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Questions: {questions.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Total Points: {totalPoints}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Status: {formData.isPublished ? 'Published' : 'Draft'}</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminDashboardLayout>
    );
}