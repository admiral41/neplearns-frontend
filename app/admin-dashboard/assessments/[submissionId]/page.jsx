// app/admin/submissions/[submissionId]/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { assessmentAPI } from "@/lib/api/assessments";
import dynamic from "next/dynamic";

const DynamicContentEditor = dynamic(() => import('@/components/editor/ContentEditor'), {
  ssr: false,
});

const DynamicContentView = dynamic(() => import('react-froala-wysiwyg/FroalaEditorView'), {
  ssr: false,
});

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { submissionId } = params;

  const [submission, setSubmission] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  
  const [gradeData, setGradeData] = useState({
    score: "",
    feedback: "",
  });

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setIsLoading(true);
      const response = await assessmentAPI.getSubmission(submissionId);

      setSubmission(response.data);
      setAssessment(response.data.assessment);
      
      // Pre-fill grade data if already graded
      if (response.data.score !== undefined) {
        setGradeData({
          score: response.data.score.toString(),
          feedback: response.data.feedback || "",
        });
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast.error('Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (!gradeData.score || isNaN(gradeData.score) || parseFloat(gradeData.score) < 0) {
      toast.error("Please enter a valid score");
      return;
    }

    if (parseFloat(gradeData.score) > (assessment?.maxScore || 100)) {
      toast.error(`Score cannot exceed maximum score of ${assessment?.maxScore || 100}`);
      return;
    }

    try {
      setIsGrading(true);
      await assessmentAPI.gradeSubmission(submissionId, {
        score: parseFloat(gradeData.score),
        feedback: gradeData.feedback.trim(),
      });

      toast.success("Submission graded successfully!");
      setShowGradeForm(false);
      fetchSubmission(); // Refresh data
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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

  if (!submission || !assessment) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
          <p className="text-muted-foreground mb-6">The submission you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
        </div>
      </AdminDashboardLayout>
    );
  }

  const isGraded = submission.score !== undefined && submission.score !== null;
  const isLate = submission.isLate;
  const student = submission.submittedBy;
  const instructor = submission.gradedBy;

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/assessments')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Button>
            <h1 className="text-2xl font-bold">Submission Review</h1>
            <p className="text-muted-foreground mt-1">
              {assessment.title} • {student?.firstname} {student?.lastname}
            </p>
          </div>

          <div className="flex gap-2">
            {!isGraded && (
              <Button
                onClick={() => setShowGradeForm(!showGradeForm)}
                variant={showGradeForm ? "outline" : "default"}
              >
                <Award className="h-4 w-4 mr-2" />
                {showGradeForm ? 'Cancel Grading' : 'Grade Submission'}
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Content */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Student's Submission</h2>
                  <div className="flex gap-2">
                    {isGraded && (
                      <Badge className={submission.score >= (assessment.passingScore || 50) ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                        {submission.score >= (assessment.passingScore || 50) ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {submission.score}/{assessment.maxScore}
                      </Badge>
                    )}
                    {isLate && (
                      <Badge variant="destructive">
                        <Clock className="h-3 w-3 mr-1" />
                        Late Submission
                      </Badge>
                    )}
                  </div>
                </div>

                {submission.contents ? (
                  <div className="prose prose-lg max-w-none border rounded-lg p-4">
                    <DynamicContentView model={submission.contents} />
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No submission content available</p>
                  </div>
                )}

                {/* Attachments */}
                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Attachments</h3>
                    <div className="space-y-2">
                      {submission.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-gray-500">{attachment.type}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grading Form */}
            {showGradeForm && !isGraded && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Grade Submission</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Score (0 - {assessment.maxScore}) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max={assessment.maxScore}
                        value={gradeData.score}
                        onChange={(e) => setGradeData(prev => ({ ...prev, score: e.target.value }))}
                        placeholder="Enter score"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Feedback</Label>
                      <div className="border rounded-md">
                        <DynamicContentEditor
                          model={gradeData.feedback}
                          handleModelChange={(content) => setGradeData(prev => ({ ...prev, feedback: content }))}
                          allowPaste={true}
                        />
                      </div>
                    </div>

                    {isLate && assessment.lateSubmissionPenalty > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">
                            Late Submission
                          </span>
                        </div>
                        <p className="text-sm text-yellow-600 mt-1">
                          Penalty: {assessment.lateSubmissionPenalty}% will be applied to the final score
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowGradeForm(false)}
                        disabled={isGrading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleGradeSubmit}
                        disabled={isGrading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isGrading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Grading...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Grade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Section */}
            {isGraded && submission.feedback && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Instructor Feedback</h2>
                    {submission.gradedAt && (
                      <span className="text-sm text-muted-foreground">
                        Graded on {formatDate(submission.gradedAt)}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-lg max-w-none border rounded-lg p-4 bg-gray-50">
                    <DynamicContentView model={submission.feedback} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info Panel */}
          <div className="space-y-6">
            {/* Assessment Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Assignment Details</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{assessment.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Score</p>
                    <p className="font-medium">{assessment.maxScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="font-medium">{assessment.passingScore || 50}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(assessment.dueDate)}</p>
                  </div>
                  {isLate && assessment.lateSubmissionPenalty > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-700">Late Penalty</p>
                      <p className="text-sm text-yellow-600">{assessment.lateSubmissionPenalty}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Student Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {student?.userImage ? (
                      <img
                        src={student.userImage}
                        alt={`${student.firstname} ${student.lastname}`}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student?.firstname} {student?.lastname}</p>
                      <p className="text-sm text-muted-foreground">{student?.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">{formatDate(submission.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grading Info */}
            {isGraded && instructor && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Grading Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {instructor?.userImage ? (
                        <img
                          src={instructor.userImage}
                          alt={`${instructor.firstname} ${instructor.lastname}`}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Award className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{instructor?.firstname} {instructor?.lastname}</p>
                        <p className="text-sm text-muted-foreground">Instructor</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Final Score</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                          {submission.finalScore || submission.score}/{assessment.maxScore}
                        </p>
                        {submission.score >= (assessment.passingScore || 50) ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Passed
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isLate && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-700">Late Penalty Applied</p>
                        <p className="text-sm text-blue-600">
                          Original: {submission.score} | After penalty: {submission.finalScore || submission.score}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="space-y-3">
                  {!isGraded && (
                    <Button
                      onClick={() => setShowGradeForm(!showGradeForm)}
                      className="w-full"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      {showGradeForm ? 'Cancel Grading' : 'Grade Submission'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Navigate back to assessments page with filters
                      router.push('/admin/assessments');
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Assessments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}