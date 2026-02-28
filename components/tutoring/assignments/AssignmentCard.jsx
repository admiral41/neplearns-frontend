'use client';

import { useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import AssignmentSubmitDialog from './AssignmentSubmitDialog';
import AssignmentFeedbackDialog from './AssignmentFeedbackDialog';
import AssignmentRequestChangesDialog from './AssignmentRequestChangesDialog';
import { useDeleteAssignment } from '@/lib/hooks/useTutoringAssignment';
import { format } from 'date-fns';
import {
  Pencil,
  Trash2,
  User,
  Clock,
  FileText,
  MessageSquare,
  Upload,
  Paperclip,
  Loader2,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

/**
 * Helper to get the latest revision request from history
 */
function getLatestRevisionRequest(assignment) {
  if (!assignment.revisionHistory?.length) return null;
  // Find the most recent revision_request entry
  for (let i = assignment.revisionHistory.length - 1; i >= 0; i--) {
    if (assignment.revisionHistory[i].type === 'revision_request') {
      return assignment.revisionHistory[i];
    }
  }
  return null;
}

/**
 * AssignmentCard - Accordion-based card for assignments
 * @param {object} assignment - Assignment object
 * @param {'instructor'|'student'} role - Current user's role
 * @param {function} onEdit - Callback when edit is clicked (instructor only)
 */
export default function AssignmentCard({ assignment, role = 'student', onEdit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);

  const deleteAssignment = useDeleteAssignment();

  const isInstructor = role === 'instructor';
  const canEdit = isInstructor && assignment.status === 'active';
  const canSubmit = !isInstructor && (assignment.status === 'active' || assignment.status === 'revision_requested');
  const canGiveFeedback = isInstructor && assignment.status === 'submitted';
  const canRequestChanges = isInstructor && assignment.status === 'submitted';
  const hasSubmission = !!assignment.submission?.submittedAt;
  const hasFeedback = !!assignment.feedback?.givenAt;
  const latestRevisionRequest = getLatestRevisionRequest(assignment);

  const personName = isInstructor
    ? `${assignment.student?.firstname || ''} ${assignment.student?.lastname || ''}`.trim()
    : `${assignment.instructor?.firstname || ''} ${assignment.instructor?.lastname || ''}`.trim();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    deleteAssignment.mutate(assignment._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(assignment);
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card">
        <div className="flex items-center px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors">
          <CollapsibleTrigger className="flex items-center gap-3 min-w-0 flex-1 text-left">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">{assignment.title}</span>
                <AssignmentStatusBadge
                  status={assignment.status}
                  dueDate={assignment.dueDate}
                  hasSubmission={hasSubmission}
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                {assignment.subject?.name && (
                  <span>{assignment.subject.name}</span>
                )}
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {personName || 'Unknown'}
                </span>
                {assignment.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
                {assignment.attachments?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {assignment.attachments.length} file(s)
                  </span>
                )}
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>

          {/* Instructor actions (edit/delete) - outside trigger to avoid nested buttons */}
          {canEdit && (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteAssignment.isPending}
              >
                {deleteAssignment.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}
        </div>

        <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              {/* Description */}
              {assignment.description && (
                <div
                  className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(assignment.description),
                  }}
                />
              )}

              {/* Attachments links */}
              {assignment.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {assignment.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={`${process.env.NEXT_PUBLIC_API_URL}${att.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 bg-muted px-2 py-1 rounded"
                    >
                      <FileText className="h-3 w-3" />
                      {att.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Submission info */}
              {hasSubmission && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Submission
                  </p>
                  {assignment.submission.content && (
                    <div
                      className="text-sm prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(assignment.submission.content),
                      }}
                    />
                  )}
                  {assignment.submission.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {assignment.submission.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={`${process.env.NEXT_PUBLIC_API_URL}${att.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 bg-background px-2 py-1 rounded"
                        >
                          <FileText className="h-3 w-3" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submitted {format(new Date(assignment.submission.submittedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}

              {/* Feedback info */}
              {hasFeedback && (
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                    Feedback
                  </p>
                  <div
                    className="text-sm prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(assignment.feedback.content),
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(assignment.feedback.givenAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}

              {/* Change request info (for students) */}
              {!isInstructor && assignment.status === 'revision_requested' && latestRevisionRequest && (
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3 space-y-1">
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

              {/* Action buttons */}
              {(canSubmit || canGiveFeedback || canRequestChanges) && (
                <div className="flex gap-2 pt-1">
                  {canSubmit && (
                    <Button size="sm" onClick={() => setSubmitOpen(true)}>
                      <Upload className="h-4 w-4 mr-1" />
                      {assignment.status === 'revision_requested' ? 'Resubmit Work' : 'Submit Work'}
                    </Button>
                  )}
                  {canGiveFeedback && (
                    <Button size="sm" onClick={() => setFeedbackOpen(true)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Give Final Feedback
                    </Button>
                  )}
                  {canRequestChanges && (
                    <Button size="sm" variant="outline" onClick={() => setRequestChangesOpen(true)}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Request Changes
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
      </Collapsible>

      {/* Dialogs */}
      <AssignmentSubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        assignment={assignment}
      />
      <AssignmentFeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        assignment={assignment}
      />
      <AssignmentRequestChangesDialog
        open={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
        assignment={assignment}
      />
    </>
  );
}
