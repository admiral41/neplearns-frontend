'use client';

import { useState } from 'react';
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
import { Loader2, FileText } from 'lucide-react';
import { useRequestChanges } from '@/lib/hooks/useTutoringAssignment';
import { format } from 'date-fns';

/**
 * AssignmentRequestChangesDialog - Dialog for instructor to request changes
 * @param {boolean} open
 * @param {function} onOpenChange
 * @param {object} assignment - The assignment with submission
 */
export default function AssignmentRequestChangesDialog({ open, onOpenChange, assignment }) {
  const [content, setContent] = useState('');

  const requestChanges = useRequestChanges();

  const handleOpenChange = (newOpen) => {
    if (!newOpen) setContent('');
    onOpenChange(newOpen);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await requestChanges.mutateAsync({
        id: assignment._id,
        content: content.trim(),
      });
      handleOpenChange(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  if (!assignment) return null;

  const submission = assignment.submission;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>
            Ask the student to revise and resubmit their work.
          </DialogDescription>
        </DialogHeader>

        {/* Submission content */}
        {submission && (
          <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Student Submission
            </p>
            {submission.content && (
              <div
                className="text-sm prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(submission.content),
                }}
              />
            )}
            {submission.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {submission.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={`${process.env.NEXT_PUBLIC_API_URL}${att.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    {att.name}
                  </a>
                ))}
              </div>
            )}
            {submission.submittedAt && (
              <p className="text-xs text-muted-foreground">
                Submitted {format(new Date(submission.submittedAt), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 py-2">
          <Label>What changes are needed?</Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Describe what the student should revise..."
            disabled={requestChanges.isPending}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={requestChanges.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requestChanges.isPending || !content.trim()}
          >
            {requestChanges.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Requesting...
              </>
            ) : (
              'Request Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
