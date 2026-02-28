"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  User,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  Calendar,
  BookOpen,
  Download,
  MessageSquare,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { assignmentAPI } from "@/lib/api/assignments";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const DynamicContentView = dynamic(() => import('react-froala-wysiwyg/FroalaEditorView'), {
  ssr: false,
});

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { submissionId } = params;

  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);

  const [gradeData, setGradeData] = useState({
    score: "",
    feedback: "",
  });

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await assignmentAPI.getSubmission(submissionId);

      setSubmission(response.data);
      setAssignment(response.data.assignment);

      // Pre-fill grade data if already graded
      if (response.data.score !== undefined && response.data.score !== null) {
        setGradeData({
          score: response.data.score.toString(),
          feedback: response.data.feedback || "",
        });
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast.error('Failed to load submission');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (!gradeData.score || isNaN(gradeData.score) || parseFloat(gradeData.score) < 0) {
      toast.error("Please enter a valid score");
      return;
    }

    if (parseFloat(gradeData.score) > (assignment?.maxScore || 100)) {
      toast.error(`Score cannot exceed maximum score of ${assignment?.maxScore || 100}`);
      return;
    }

    try {
      setIsGrading(true);
      const newScore = parseFloat(gradeData.score);
      const newFeedback = gradeData.feedback.trim();

      await assignmentAPI.gradeSubmission(submissionId, {
        score: newScore,
        feedback: newFeedback,
      });

      // Update local state immediately for instant UI feedback
      setSubmission(prev => ({
        ...prev,
        score: newScore,
        feedback: newFeedback,
        gradedAt: new Date().toISOString(),
      }));

      toast.success("Submission graded successfully!");

      // Background refresh to get authoritative data from server
      fetchSubmission(false);
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error(error.response?.data?.msg || 'Failed to grade submission');
    } finally {
      setIsGrading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!submission || !assignment) {
    return (
      <AdminDashboardLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold mb-2">Submission Not Found</h2>
            <p className="text-muted-foreground mb-6">The submission you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/admin-dashboard/assignments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  const isGraded = submission.score !== undefined && submission.score !== null;
  const isLate = submission.isLate;
  const student = submission.submittedBy;
  const isPassing = isGraded && submission.score >= (assignment.passingScore || 50);

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin-dashboard/assignments')}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-lg sm:text-xl font-bold">Grade Submission</h1>
                {isGraded ? (
                  <Badge className={isPassing ? "bg-green-500" : "bg-red-500"}>
                    {isPassing ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    {isPassing ? "Passed" : "Failed"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
                {isLate && (
                  <Badge variant="destructive">
                    Late
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {assignment.title}
              </p>
            </div>

            {isGraded && (
              <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">{submission.score}<span className="text-lg text-muted-foreground">/{assignment.maxScore}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {student?.userImage ? (
                    <img
                      src={student.userImage}
                      alt={`${student.firstname} ${student.lastname}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{student?.firstname} {student?.lastname}</p>
                    <p className="text-sm text-muted-foreground">{student?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm font-medium">{formatDate(submission.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submission Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submission.contents ? (
                  <div className="prose prose-sm max-w-none bg-muted/30 rounded-lg p-4 border">
                    <DynamicContentView model={submission.contents} />
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                    <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No text content submitted</p>
                  </div>
                )}

                {/* Attachments */}
                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Attachments ({submission.attachments.length})</p>
                    <div className="space-y-2">
                      {submission.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.type}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grading Section */}
            <Card className={!isGraded ? "border-primary/50 shadow-sm" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  {isGraded ? "Grade & Feedback" : "Grade This Submission"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="score">
                        Score <span className="text-muted-foreground">(max: {assignment.maxScore})</span>
                      </Label>
                      <Input
                        id="score"
                        type="number"
                        min="0"
                        max={assignment.maxScore}
                        value={gradeData.score}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty or valid numbers only
                          if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= assignment.maxScore)) {
                            setGradeData(prev => ({ ...prev, score: value }));
                          } else if (parseFloat(value) > assignment.maxScore) {
                            // Cap at max score
                            setGradeData(prev => ({ ...prev, score: assignment.maxScore.toString() }));
                            toast.error(`Score cannot exceed ${assignment.maxScore}`);
                          }
                        }}
                        placeholder="Enter score"
                        className="text-lg font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">
                        Passing score: {assignment.passingScore || 50}
                      </p>
                    </div>

                    {isLate && assignment.lateSubmissionPenalty > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Late Submission</p>
                          <p className="text-xs text-yellow-700">
                            {assignment.lateSubmissionPenalty}% penalty will be applied
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Feedback <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea
                      id="feedback"
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                      placeholder="Provide feedback to the student..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/admin-dashboard/assignments')}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGradeSubmit}
                      disabled={isGrading || !gradeData.score}
                    >
                      {isGrading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {isGraded ? "Update Grade" : "Submit Grade"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Assignment Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Title</p>
                  <p className="font-medium mt-1">{assignment.title}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Max Score</p>
                    <p className="font-semibold text-lg mt-1">{assignment.maxScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Pass Score</p>
                    <p className="font-semibold text-lg mt-1">{assignment.passingScore || 50}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due Date
                  </p>
                  <p className="font-medium mt-1">{formatDate(assignment.dueDate)}</p>
                </div>

                {assignment.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p>
                      <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Grading Summary - Only show if graded */}
            {isGraded && (
              <Card className={isPassing ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {isPassing ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-2">
                    <p className="text-4xl font-bold">
                      {submission.finalScore || submission.score}
                      <span className="text-lg text-muted-foreground font-normal">/{assignment.maxScore}</span>
                    </p>
                    <p className={`text-sm font-medium mt-1 ${isPassing ? "text-green-600" : "text-red-600"}`}>
                      {isPassing ? "Passed" : "Failed"}
                    </p>
                    {isLate && submission.penaltyApplied > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Original: {submission.score} | Penalty: -{submission.penaltyApplied}%
                      </p>
                    )}
                  </div>

                  {submission.gradedAt && (
                    <div className="mt-4 pt-4 border-t text-center">
                      <p className="text-xs text-muted-foreground">
                        Graded on {formatDate(submission.gradedAt)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/admin-dashboard/assignments')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Assignments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
