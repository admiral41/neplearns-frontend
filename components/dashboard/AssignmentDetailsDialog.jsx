"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Check,
  MessageSquare,
  AlertCircle,
  Download,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AssignmentDetailsDialog({
  assignment,
  open,
  onOpenChange,
  dashboardMode = false,
}) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  if (!assignment) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error(
        "Only PDF, Images (JPG, PNG), and Word documents are allowed"
      );
      return;
    }

    // Check file size (max 10MB per file)
    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      toast.error("Each file must be less than 10MB");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to submit");
      return;
    }

    setUploading(true);

    try {
      // Simulate upload - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Assignment submitted successfully!");
      setSelectedFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl pr-8">
            {assignment.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-3 flex-wrap text-sm pt-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Due: {assignment.dueDate}
            </span>
            <Badge variant="outline">
              Total Marks: {assignment.totalMarks}
            </Badge>
            {assignment.submitted && (
              <Badge
                variant={
                  assignment.feedback?.reviewed ? "default" : "secondary"
                }
                className={
                  assignment.feedback?.reviewed
                    ? "bg-success text-success-foreground"
                    : ""
                }
              >
                {assignment.feedback?.reviewed
                  ? `Graded: ${assignment.feedback.marks}/${assignment.totalMarks}`
                  : "Pending Review"}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Assignment Description */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Assignment Details
              </h3>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: assignment.description }}
              />
            </CardContent>
          </Card>

          {/* Teacher Feedback Section */}
          {assignment.submitted && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Teacher Feedback
                </h3>

                {assignment.feedback?.reviewed ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded border-l-4 border-success">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-success" />
                        <span className="font-semibold text-success">
                          Assignment Reviewed
                        </span>
                      </div>
                      <Badge className="bg-success text-success-foreground hover:bg-success">
                        {assignment.feedback.marks}/{assignment.totalMarks}
                      </Badge>
                    </div>

                    <div className="p-4 bg-muted/30 rounded">
                      <p className="text-sm leading-relaxed">
                        {assignment.feedback.comment}
                      </p>
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <p>Reviewed by: {assignment.feedback.reviewedBy}</p>
                        <p>Date: {assignment.feedback.reviewedDate}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/30 rounded border-l-4 border-primary">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">
                          Awaiting Teacher Review
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your assignment has been submitted successfully. Your
                          teacher will review it soon and provide feedback.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted on: {assignment.submittedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dashboard Mode - Navigation to Course */}
          {dashboardMode && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                    <p className="text-sm text-foreground mb-3">
                      {assignment.submitted
                        ? "View your submission and feedback in the course module"
                        : "To submit this assignment, please go to the course module"}
                    </p>
                    <Button
                      onClick={() => {
                        router.push(`/student-dashboard/courses/${assignment.courseId}?tab=assignments`);
                        onOpenChange(false);
                      }}
                      className="w-full"
                    >
                      Go to Course
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Submission Section */}
          {!dashboardMode && !assignment.submitted && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Submit Your Work
                </h3>

                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer block"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, JPG, PNG, or Word (Max 10MB per file)
                      </p>
                    </label>
                  </div>

                  {/* Selected Files List */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Selected Files ({selectedFiles.length})
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded border"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {getFileIcon(file)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="shrink-0 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedFiles.length === 0 || uploading}
                      className="flex-1"
                    >
                      {uploading ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Info Message */}
                  <div className="p-3 bg-info/10 rounded border border-info/20">
                    <p className="text-xs text-foreground">
                      <strong>Note:</strong> Make sure to review your work
                      before submitting. You can upload multiple files if
                      needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* View Submitted Files (if already submitted and not in dashboard mode) */}
          {!dashboardMode && assignment.submitted && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Your Submission
                </h3>

                <div className="space-y-2">
                  {/* Mock submitted files - replace with actual data */}
                  {[
                    {
                      name: "assignment_solution.pdf",
                      size: "2.3 MB",
                      type: "application/pdf",
                    },
                    { name: "diagram.jpg", size: "450 KB", type: "image/jpeg" },
                  ].map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded border"
                    >
                      <div className="flex items-center gap-2.5 flex-1">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Submitted on: {assignment.submittedDate}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
