"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Award,
    Clock,
    Calendar,
    User,
    FileText,
    Download,
    Share2,
    TrendingUp,
    TrendingDown,
    Eye,
    ChevronDown,
    ChevronUp,
    HelpCircle,
} from "lucide-react";

// API services
import { quizAPI } from "@/lib/api/quizzes";

export default function QuizResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { quizId, attemptId } = params;

    // State
    const [quiz, setQuiz] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState({});

    // Fetch results
    useEffect(() => {
        if (quizId && attemptId) {
            fetchResults();
        }
    }, [quizId, attemptId]);

    const fetchResults = async () => {
        setIsLoading(true);
        try {
            // Fetch attempt details
            const attemptResponse = await quizAPI.getAttempt(attemptId);
            const attemptData = attemptResponse.data.attempt;
            const logs = attemptResponse.data.logs;

            // Fetch quiz details
            const quizResponse = await quizAPI.getQuiz(quizId);
            
            setQuiz(quizResponse.data);
            setAttempt(attemptData);
            
            // Process results
            const processedResults = logs.map(log => ({
                ...log,
                question: log.questionId,
                isCorrect: log.isCorrect,
                pointsEarned: log.pointsEarned,
                maxPoints: log.maxPoints || 1,
            }));
            
            setResults(processedResults);
        } catch (error) {
            console.error('Error fetching results:', error);
            toast.error('Failed to load quiz results');
            router.push(`/course/${quizId}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleQuestion = (questionId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const getScoreColor = (percentage) => {
        const passingScore = quiz?.passingScore || 50;
        
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 80) return "text-green-500";
        if (percentage >= 70) return "text-yellow-600";
        if (percentage >= passingScore) return "text-yellow-500";
        return "text-red-600";
    };

    const getStatusBadge = () => {
        if (!attempt || !quiz) return null;
        
        const isPassed = attempt.isPassed || attempt.percentage >= (quiz.passingScore || 50);
        
        if (isPassed) {
            return (
                <Badge className="bg-green-500 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Passed
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-red-500 gap-1">
                    <XCircle className="h-3 w-3" />
                    Failed
                </Badge>
            );
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "N/A";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const calculateCorrectCount = () => {
        return results.filter(r => r.isCorrect).length;
    };

    const handleRetake = () => {
        router.push(`/quiz/${quizId}/take`);
    };

    const handleViewAllAttempts = () => {
        router.push(`/quiz/${quizId}/attempts`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading results...</p>
                </div>
            </div>
        );
    }

    if (!quiz || !attempt) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Results not found</h3>
                    <p className="text-muted-foreground mb-4">
                        The results you're looking for don't exist or were deleted.
                    </p>
                    <Button onClick={() => router.push(`/course/${quizId}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course
                    </Button>
                </div>
            </div>
        );
    }

    const isPassed = attempt.isPassed || attempt.percentage >= (quiz.passingScore || 50);
    const correctCount = calculateCorrectCount();
    const totalQuestions = results.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
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
                            <h1 className="text-lg sm:text-xl font-bold">{quiz.title} - Results</h1>
                            <p className="text-muted-foreground mt-1">
                                Attempt #{attempt.attemptNumber} • {new Date(attempt.completedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleViewAllAttempts}>
                                View All Attempts
                            </Button>
                            {attempt.attemptNumber < quiz.maxAttempts && (
                                <Button onClick={handleRetake}>
                                    Retake Quiz
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className={`text-4xl font-bold mb-2 ${getScoreColor(attempt.percentage)}`}>
                                    {attempt.percentage.toFixed(1)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Score</div>
                                <div className="mt-2">{getStatusBadge()}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">
                                    {correctCount}/{totalQuestions}
                                </div>
                                <div className="text-sm text-muted-foreground">Correct Answers</div>
                                <div className="mt-2 text-sm">
                                    {((correctCount / totalQuestions) * 100).toFixed(1)}% accuracy
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">
                                    {attempt.score || 0}/{quiz.totalPoints || totalQuestions}
                                </div>
                                <div className="text-sm text-muted-foreground">Points Earned</div>
                                <div className="mt-2 text-sm">
                                    Passing score: {quiz.passingScore || 50}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">
                                    {formatDuration(attempt.timeTaken)}
                                </div>
                                <div className="text-sm text-muted-foreground">Time Taken</div>
                                {quiz.isTimed && (
                                    <div className="mt-2 text-sm">
                                        Duration: {quiz.duration} minutes
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Message */}
                <Alert className={`mb-8 ${isPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        {isPassed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <AlertDescription className="font-medium">
                            {isPassed ? (
                                <>
                                    Congratulations! You passed this quiz with a score of {attempt.percentage.toFixed(1)}%.
                                    {attempt.attemptNumber < quiz.maxAttempts && (
                                        <span className="block text-sm font-normal mt-1">
                                            You can retake the quiz to improve your score.
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    You scored {attempt.percentage.toFixed(1)}%, which is below the passing score of {quiz.passingScore || 50}%.
                                    {attempt.attemptNumber < quiz.maxAttempts && (
                                        <span className="block text-sm font-normal mt-1">
                                            You can retake the quiz. Attempts remaining: {quiz.maxAttempts - attempt.attemptNumber}.
                                        </span>
                                    )}
                                </>
                            )}
                        </AlertDescription>
                    </div>
                </Alert>

                {/* Detailed Results */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Question Review</CardTitle>
                        <CardDescription>
                            Review your answers and see explanations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {results.map((result, index) => (
                                <div key={result.questionId || index} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                                                result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {result.isCorrect ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium">
                                                    Question {index + 1}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.question?.questionText || 'Question not available'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {result.pointsEarned || 0}/{result.maxPoints || 1} points
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {result.question?.questionType?.replace('_', ' ') || ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Answer Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Your Answer</Label>
                                            <div className={`p-3 rounded-md ${
                                                result.isCorrect 
                                                    ? 'bg-green-50 border border-green-200' 
                                                    : 'bg-red-50 border border-red-200'
                                            }`}>
                                                <p className="text-sm">
                                                    {result.answer?.[0] || result.selectedOption || 'No answer provided'}
                                                </p>
                                            </div>
                                        </div>

                                        {!result.isCorrect && result.question?.questionType !== 'essay' && (
                                            <div>
                                                <Label className="text-sm font-medium mb-2 block">Correct Answer</Label>
                                                <div className="p-3 rounded-md bg-green-50 border border-green-200">
                                                    <p className="text-sm">
                                                        {result.question?.correctAnswers?.[0] || 
                                                         result.question?.options?.find(opt => opt.isCorrect)?.text || 
                                                         'Not available'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Explanation */}
                                    {result.question?.explanation && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => toggleQuestion(result.questionId || index)}
                                                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                            >
                                                {expandedQuestions[result.questionId || index] ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4" />
                                                        Hide Explanation
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4" />
                                                        Show Explanation
                                                    </>
                                                )}
                                            </button>
                                            
                                            {expandedQuestions[result.questionId || index] && (
                                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                    <p className="text-sm">{result.question.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Feedback for essay questions needing grading */}
                                    {result.needsGrading && (
                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                            <div className="flex items-center gap-2 text-amber-800">
                                                <HelpCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    This essay question is pending manual grading.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-4">Score Distribution</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Correct Answers</span>
                                            <span>{((correctCount / totalQuestions) * 100).toFixed(1)}%</span>
                                        </div>
                                        <Progress value={(correctCount / totalQuestions) * 100} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Incorrect Answers</span>
                                            <span>{(((totalQuestions - correctCount) / totalQuestions) * 100).toFixed(1)}%</span>
                                        </div>
                                        <Progress value={((totalQuestions - correctCount) / totalQuestions) * 100} className="h-2" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-4">Attempt Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Started At:</span>
                                        <span>{new Date(attempt.startedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Completed At:</span>
                                        <span>{new Date(attempt.completedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Time Taken:</span>
                                        <span>{formatDuration(attempt.timeTaken)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span className={isPassed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                            {isPassed ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" />
                        Print Results
                    </Button>
                    {attempt.attemptNumber < quiz.maxAttempts && (
                        <Button onClick={handleRetake}>
                            Retake Quiz
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}