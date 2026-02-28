"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Timer,
    Save,
    Send,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    FileText,
    Type,
    CheckSquare,
    Radio as RadioIcon,
} from "lucide-react";

// API services
import { quizAPI } from "@/lib/api/quizzes";

export default function TakeQuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId;

    // State
    const [quiz, setQuiz] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [startedAt, setStartedAt] = useState(null);

    // Fetch quiz and start attempt
    useEffect(() => {
        if (quizId) {
            startQuizAttempt();
        }
    }, [quizId]);

    // Timer effect
    useEffect(() => {
        if (!quiz?.isTimed || !timeRemaining || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz?.isTimed, timeRemaining]);

    const startQuizAttempt = async () => {
        setIsLoading(true);
        try {
            // Start quiz attempt
            const attemptResponse = await quizAPI.startQuizAttempt(quizId);
            const { attempt: newAttempt, quiz: quizData, questions: quizQuestions, timeRemaining: initialTime } = attemptResponse.data;

            setQuiz(quizData);
            setAttempt(newAttempt);
            setQuestions(quizQuestions);
            setStartedAt(new Date());
            setTimeRemaining(initialTime);

            // Initialize answers
            const initialAnswers = {};
            quizQuestions.forEach((q, index) => {
                initialAnswers[q._id] = {
                    questionId: q._id,
                    questionType: q.questionType,
                    answer: [],
                    selectedOptions: [],
                    selectedOption: null,
                    timeSpent: 0,
                };
            });
            setAnswers(initialAnswers);
        } catch (error) {
            console.error('Error starting quiz:', error);
            toast.error(error.message || 'Failed to start quiz');
            router.push(`/course/${quizId}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoSubmit = async () => {
        toast.warning("Time's up! Submitting your quiz...");
        await handleSubmit();
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, value, type) => {
        setAnswers(prev => {
            const question = questions.find(q => q._id === questionId);
            if (!question) return prev;

            const currentAnswer = { ...prev[questionId] };
            
            switch (type) {
                case 'single_choice':
                    currentAnswer.selectedOption = value;
                    currentAnswer.selectedOptions = [];
                    currentAnswer.answer = [value];
                    break;
                case 'multiple_choice':
                    const currentOptions = currentAnswer.selectedOptions || [];
                    const newOptions = currentOptions.includes(value)
                        ? currentOptions.filter(opt => opt !== value)
                        : [...currentOptions, value];
                    currentAnswer.selectedOptions = newOptions;
                    currentAnswer.answer = newOptions;
                    break;
                case 'short_answer':
                case 'essay':
                    currentAnswer.answer = [value];
                    break;
            }

            // Update time spent
            if (startedAt) {
                const timeElapsed = Math.floor((new Date() - startedAt) / 1000);
                currentAnswer.timeSpent = timeElapsed;
            }

            return {
                ...prev,
                [questionId]: currentAnswer
            };
        });
    };

    const navigateQuestion = (direction) => {
        if (direction === 'prev' && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const getAnsweredCount = () => {
        return Object.values(answers).filter(answer => {
            if (answer.questionType === 'multiple_choice') {
                return answer.selectedOptions && answer.selectedOptions.length > 0;
            } else if (answer.questionType === 'single_choice') {
                return answer.selectedOption !== null;
            } else {
                return answer.answer && answer.answer.length > 0 && answer.answer[0].trim() !== '';
            }
        }).length;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const answeredCount = getAnsweredCount();
        if (answeredCount < questions.length) {
            const confirmSubmit = window.confirm(
                `You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`
            );
            if (!confirmSubmit) return;
        }

        setIsSubmitting(true);
        try {
            const answersArray = Object.values(answers);
            await quizAPI.submitQuizAttempt(quizId, attempt._id, answersArray);

            toast.success("Quiz submitted successfully!");
            
            // Redirect to results if shown immediately
            if (quiz.showResults) {
                router.push(`/quiz/${quizId}/results/${attempt._id}`);
            } else {
                router.push(`/course/${quizId}`);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error(error.message || 'Failed to submit quiz');
            setIsSubmitting(false);
        }
    };

    const saveProgress = () => {
        // Implement auto-save if needed
        toast.info("Progress saved automatically");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz || !attempt) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Unable to start quiz</h3>
                    <p className="text-muted-foreground mb-4">
                        There was an error loading the quiz. Please try again.
                    </p>
                    <Button onClick={() => router.push(`/course/${quizId}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion?._id] || {};

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/course/${quiz.course?._id || ''}`)}
                                className="gap-2 mb-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Course
                            </Button>
                            <h1 className="text-xl font-bold">{quiz.title}</h1>
                            {quiz.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {quiz.description}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col md:items-end gap-2">
                            {quiz.isTimed && timeRemaining !== null && (
                                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg">
                                    <Timer className="h-5 w-5" />
                                    <span className="font-mono text-lg font-bold">
                                        {formatTime(timeRemaining)}
                                    </span>
                                    <span className="text-sm">remaining</span>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    {getAnsweredCount()}/{questions.length} answered
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={saveProgress}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Progress
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.round((getAnsweredCount() / questions.length) * 100)}%</span>
                        </div>
                        <Progress value={(getAnsweredCount() / questions.length) * 100} className="h-2" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column - Question Navigator */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Questions</CardTitle>
                                <CardDescription>
                                    Click to navigate
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-3 gap-2">
                                    {questions.map((question, index) => {
                                        const isAnswered = answers[question._id] && (
                                            (question.questionType === 'multiple_choice' && 
                                             answers[question._id].selectedOptions?.length > 0) ||
                                            (question.questionType === 'single_choice' && 
                                             answers[question._id].selectedOption !== null) ||
                                            (['short_answer', 'essay'].includes(question.questionType) && 
                                             answers[question._id].answer?.[0]?.trim() !== '')
                                        );

                                        return (
                                            <button
                                                key={question._id}
                                                onClick={() => goToQuestion(index)}
                                                className={`
                                                    h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium
                                                    ${index === currentQuestionIndex
                                                        ? 'bg-primary text-primary-foreground'
                                                        : isAnswered
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }
                                                    hover:opacity-90 transition-opacity
                                                `}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                                        <span>Current question</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="h-3 w-3 rounded-full bg-green-100 border border-green-200"></div>
                                        <span>Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="h-3 w-3 rounded-full bg-gray-100 border border-gray-200"></div>
                                        <span>Unanswered</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quiz Instructions */}
                        {quiz.instructions && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-sm">Instructions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                        {quiz.instructions}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Question & Answers */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Question {currentQuestionIndex + 1} of {questions.length}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {currentQuestion.questionType === 'multiple_choice' && (
                                                <span className="flex items-center gap-1">
                                                    <CheckSquare className="h-3 w-3" />
                                                    Select all that apply
                                                </span>
                                            )}
                                            {currentQuestion.questionType === 'single_choice' && (
                                                <span className="flex items-center gap-1">
                                                    <RadioIcon className="h-3 w-3" />
                                                    Select one option
                                                </span>
                                            )}
                                            {currentQuestion.questionType === 'short_answer' && (
                                                <span className="flex items-center gap-1">
                                                    <Type className="h-3 w-3" />
                                                    Type your answer
                                                </span>
                                            )}
                                            {currentQuestion.questionType === 'essay' && (
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    Write your answer in detail
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="gap-1">
                                        {currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Question Text */}
                                <div className="prose max-w-none">
                                    <h3 className="text-lg font-medium">
                                        {currentQuestion.questionText}
                                    </h3>
                                </div>

                                {/* Answer Input */}
                                <div className="space-y-4">
                                    {currentQuestion.questionType === 'single_choice' && (
                                        <RadioGroup
                                            value={currentAnswer.selectedOption || ''}
                                            onValueChange={(value) => 
                                                handleAnswerChange(currentQuestion._id, value, 'single_choice')
                                            }
                                            className="space-y-3"
                                        >
                                            {currentQuestion.options?.map((option, index) => (
                                                <div key={option._id} className="flex items-center space-x-3">
                                                    <RadioGroupItem value={option._id} id={`opt-${option._id}`} />
                                                    <Label
                                                        htmlFor={`opt-${option._id}`}
                                                        className="flex-1 cursor-pointer p-3 border rounded-md hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-500">
                                                                {String.fromCharCode(65 + index)}.
                                                            </span>
                                                            <span>{option.text}</span>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}

                                    {currentQuestion.questionType === 'multiple_choice' && (
                                        <div className="space-y-3">
                                            {currentQuestion.options?.map((option, index) => (
                                                <div key={option._id} className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`opt-${option._id}`}
                                                        checked={currentAnswer.selectedOptions?.includes(option._id) || false}
                                                        onCheckedChange={(checked) => {
                                                            handleAnswerChange(currentQuestion._id, option._id, 'multiple_choice');
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`opt-${option._id}`}
                                                        className="flex-1 cursor-pointer p-3 border rounded-md hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-500">
                                                                {String.fromCharCode(65 + index)}.
                                                            </span>
                                                            <span>{option.text}</span>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {currentQuestion.questionType === 'short_answer' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="short-answer">Your Answer</Label>
                                            <Input
                                                id="short-answer"
                                                value={currentAnswer.answer?.[0] || ''}
                                                onChange={(e) => 
                                                    handleAnswerChange(currentQuestion._id, e.target.value, 'short_answer')
                                                }
                                                placeholder="Type your answer here..."
                                            />
                                        </div>
                                    )}

                                    {currentQuestion.questionType === 'essay' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="essay-answer">Your Answer</Label>
                                            <Textarea
                                                id="essay-answer"
                                                value={currentAnswer.answer?.[0] || ''}
                                                onChange={(e) => 
                                                    handleAnswerChange(currentQuestion._id, e.target.value, 'essay')
                                                }
                                                placeholder="Write your detailed answer here..."
                                                rows={8}
                                                className="resize-y"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigateQuestion('prev')}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </Button>

                                    <div className="flex gap-2">
                                        {currentQuestionIndex < questions.length - 1 ? (
                                            <Button
                                                onClick={() => navigateQuestion('next')}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Submit Quiz
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quiz Info */}
                        <Card className="mt-4">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total Questions</p>
                                        <p className="font-medium">{questions.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Answered</p>
                                        <p className="font-medium">{getAnsweredCount()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Time Remaining</p>
                                        <p className="font-medium">
                                            {quiz.isTimed ? formatTime(timeRemaining) : 'Unlimited'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Attempt</p>
                                        <p className="font-medium">{attempt?.attemptNumber || 1}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Submission Modal */}
            <div className="fixed bottom-6 right-6">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="shadow-lg"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="h-5 w-5 mr-2" />
                            Submit Quiz
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}