"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, quizId } = params;
  const { showAlert } = useAlertDialog();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock quiz data
  const quiz = {
    id: quizId,
    title: "Introduction to Algebra Quiz",
    courseTitle: "Mathematics - Algebra",
    week: 1,
    totalMarks: 20,
    passingMarks: 12,
    duration: 30, // minutes
    questions: [
      {
        id: 1,
        question: "What is algebra?",
        type: "multiple-choice",
        marks: 2,
        options: [
          "A branch of mathematics dealing with symbols",
          "A type of calculator",
          "A mathematical formula",
          "A geometry tool",
        ],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: "Which of the following is a variable?",
        type: "multiple-choice",
        marks: 2,
        options: ["5", "x", "10", "100"],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: "What is 2x + 5 when x = 3?",
        type: "multiple-choice",
        marks: 3,
        options: ["8", "11", "13", "16"],
        correctAnswer: 1,
      },
      {
        id: 4,
        question: "In the equation x + 7 = 12, what is x?",
        type: "multiple-choice",
        marks: 3,
        options: ["3", "4", "5", "6"],
        correctAnswer: 2,
      },
      {
        id: 5,
        question: "Which of these is an algebraic expression?",
        type: "multiple-choice",
        marks: 2,
        options: ["5 + 3", "2x - 4", "10 = 10", "7 × 2"],
        correctAnswer: 1,
      },
    ],
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleConfirmSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitClick = () => {
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = quiz.questions.length - answeredCount;

    showAlert({
      title: "Submit Quiz?",
      description:
        unansweredCount > 0
          ? `You have answered ${answeredCount} out of ${quiz.questions.length} questions. ${unansweredCount} question(s) are unanswered.\n\nAre you sure you want to submit? Unanswered questions will be marked as incorrect.`
          : `You have answered all ${quiz.questions.length} questions.\n\nAre you sure you want to submit your quiz? You won't be able to change your answers after submission.`,
      confirmText: "Submit Quiz",
      cancelText: "Review Answers",
      variant: "success",
      onConfirm: handleConfirmSubmit,
    });
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    // API call to submit quiz
    setTimeout(() => {
      toast.success("Quiz submitted successfully!");
      router.push(`/student-dashboard/courses/${courseId}`);
    }, 1000);
  };

  const question = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = ((answeredCount / quiz.questions.length) * 100).toFixed(0);

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold mb-1">
                  {quiz.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {quiz.courseTitle} • Week {quiz.week}
                </p>
              </div>
              <Badge
                variant={timeLeft < 300 ? "destructive" : "secondary"}
                className="text-base sm:text-lg px-3 py-1.5"
              >
                <Clock className="h-4 w-4 mr-1.5" />
                {formatTime(timeLeft)}
              </Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <span className="text-muted-foreground">
                  {answeredCount}/{quiz.questions.length} answered
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            {/* Question */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <Badge variant="outline" className="shrink-0">
                  {question.marks} marks
                </Badge>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">
                {question.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = answers[currentQuestion] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                          }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        )}
                      </div>
                      <span className="font-medium text-sm sm:text-base">
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === quiz.questions.length - 1 && (
              <Button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentQuestion === quiz.questions.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Warning for unanswered */}
        {answeredCount < quiz.questions.length && (
          <div className="mt-6">
            <div className="flex items-start gap-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  You have {quiz.questions.length - answeredCount} unanswered
                  question(s)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Make sure to answer all questions before submitting
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
