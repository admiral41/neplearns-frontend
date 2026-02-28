'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import RichTextEditor from './RichTextEditor';
import DOMPurify from 'dompurify';
import { Loader2, Upload, X, FileText, Clock, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitAssignment } from '@/lib/hooks/useTutoringAssignment';
import { format } from 'date-fns';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

/**
 * Helper to get the latest revision request from history
 */
function getLatestRevisionRequest(assignment) {
  if (!assignment?.revisionHistory?.length) return null;
  for (let i = assignment.revisionHistory.length - 1; i >= 0; i--) {
    if (assignment.revisionHistory[i].type === 'revision_request') {
      return assignment.revisionHistory[i];
    }
  }
  return null;
}

/**
 * AssignmentSubmitDialog - Dialog for student to submit work
 * @param {boolean} open
 * @param {function} onOpenChange
 * @param {object} assignment - The assignment to submit for
 */
export default function AssignmentSubmitDialog({ open, onOpenChange, assignment }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const submitAssignment = useSubmitAssignment();

  const resetForm = () => {
    setContent('');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported file type.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 5MB limit.`);
        return;
      }
    }

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error('Please write something or upload files.');
      return;
    }

    try {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content.trim());
      files.forEach((file) => formData.append('attachments', file));

      await submitAssignment.mutateAsync({
        id: assignment._id,
        formData,
      });

      handleOpenChange(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  if (!assignment) return null;

  const isResubmission = assignment.status === 'revision_requested';
  const latestRevisionRequest = getLatestRevisionRequest(assignment);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isResubmission ? 'Resubmit Assignment' : 'Submit Assignment'}</DialogTitle>
          <DialogDescription>
            {isResubmission
              ? 'Address the requested changes and resubmit your work.'
              : 'Submit your work for this assignment.'}
          </DialogDescription>
        </DialogHeader>

        {/* Change request info (when resubmitting) */}
        {isResubmission && latestRevisionRequest && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 space-y-1">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wide">
              Changes Requested
            </p>
            <div
              className="text-sm prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(latestRevisionRequest.content),
              }}
            />
            <p className="text-xs text-muted-foreground">
              {format(new Date(latestRevisionRequest.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        )}

        {/* Assignment context */}
        <div className="p-3 bg-muted/50 rounded-lg border space-y-1">
          <h4 className="font-medium text-sm">{assignment.title}</h4>
          {assignment.description && (
            <div
              className="text-xs text-muted-foreground line-clamp-3 prose prose-xs max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(assignment.description),
              }}
            />
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {assignment.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
              </span>
            )}
            {assignment.attachments?.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {assignment.attachments.length} reference file(s)
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 py-2">
          {/* Content */}
          <div className="space-y-2">
            <Label>Your Notes / Answer</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your response here..."
              disabled={submitAssignment.isPending}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
              onChange={handleFileChange}
              className="hidden"
              disabled={submitAssignment.isPending}
            />

            {files.length < MAX_FILES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange({ target: { files: e.dataTransfer.files } });
                }}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, JPEG, PNG (max 5MB each)
                </p>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-2 mt-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 border rounded bg-muted/30"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeFile(idx)}
                      disabled={submitAssignment.isPending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitAssignment.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitAssignment.isPending || (!content.trim() && files.length === 0)}
          >
            {submitAssignment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isResubmission ? 'Resubmitting...' : 'Submitting...'}
              </>
            ) : (
              isResubmission ? 'Resubmit' : 'Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
