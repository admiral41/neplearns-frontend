'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SessionStatusBadge from './SessionStatusBadge';
import { format } from 'date-fns';
import { Video, Clock, User, BookOpen, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

/**
 * SessionDetailModal - Modal showing session details with join button
 * @param {Object} session - Session object with all details
 * @param {boolean} open - Whether modal is open
 * @param {Function} onOpenChange - Callback when open state changes
 */
export default function SessionDetailModal({ session, open, onOpenChange }) {
  if (!session) return null;

  const scheduledAt = new Date(session.scheduledAt);
  const endTime = new Date(scheduledAt.getTime() + session.duration * 60000);

  // Format attendance display
  const getAttendanceDisplay = (attendance) => {
    if (!attendance || attendance === 'pending') return null;

    const isPresent = attendance === 'present';
    return {
      label: attendance.charAt(0).toUpperCase() + attendance.slice(1),
      variant: isPresent ? 'default' : 'destructive',
      className: isPresent ? 'bg-green-100 text-green-800' : '',
      Icon: isPresent ? CheckCircle : XCircle,
    };
  };

  const attendanceInfo = getAttendanceDisplay(session.attendance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {session.subject?.name || 'Tutoring Session'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <SessionStatusBadge status={session.status} />
          </div>

          {/* Instructor */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-4 w-4" />
              Instructor
            </span>
            <span className="font-medium">
              {session.instructor?.firstname} {session.instructor?.lastname}
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Schedule
            </span>
            <span className="text-right">
              <div className="font-medium">
                {format(scheduledAt, 'EEEE, MMM d, yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(scheduledAt, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </div>
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duration</span>
            <span>{session.duration} minutes</span>
          </div>

          {/* Attendance (for completed sessions) */}
          {session.status === 'completed' && attendanceInfo && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <attendanceInfo.Icon className="h-4 w-4" />
                Attendance
              </span>
              <Badge
                variant={attendanceInfo.variant}
                className={attendanceInfo.className}
              >
                {attendanceInfo.label}
              </Badge>
            </div>
          )}

          {/* Live indicator when session has started */}
          {session.status === 'live' && (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Session is Live - Your instructor has started the session
              </span>
            </div>
          )}

          {/* Join Button - show for scheduled/live sessions */}
          {(session.status === 'scheduled' || session.status === 'live') && (
            <div className="pt-4 border-t">
              {session.meetingLink ? (
                session.canJoin ? (
                  <Button asChild className="w-full">
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Session
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <div className="text-center p-3 bg-muted rounded-md text-sm text-muted-foreground">
                    Join button will be available 15 minutes before the session starts.
                  </div>
                )
              ) : (
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-md text-sm">
                  No meeting link added yet. Please contact your instructor.
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {session.notes && (
            <div className="pt-4 border-t">
              <span className="text-sm text-muted-foreground">Notes</span>
              <p className="mt-1 text-sm bg-muted p-3 rounded-md">{session.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
