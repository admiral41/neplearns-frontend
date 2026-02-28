'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SessionStatusBadge from './SessionStatusBadge';
import SessionEditDialog from './SessionEditDialog';
import AttendanceMarker from './AttendanceMarker';
import { useCancelSession, useStartSession, useEndSession } from '@/lib/hooks/useTutoringSession';
import { format } from 'date-fns';
import {
  Pencil,
  Trash2,
  Link as LinkIcon,
  User,
  Clock,
  Copy,
  Check,
  Loader2,
  Play,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * InstructorSessionCard - Card displaying a tutoring session for instructor view
 * @param {object} session - Session object with student, subject, scheduledAt, etc.
 */
export default function InstructorSessionCard({ session }) {
  const [editOpen, setEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cancelSession = useCancelSession();
  const startSession = useStartSession();
  const endSession = useEndSession();

  const scheduledAt = new Date(session.scheduledAt);
  const endTime = new Date(scheduledAt.getTime() + session.duration * 60000);

  const handleStart = async () => {
    await startSession.mutateAsync(session._id);
  };

  const handleEnd = async () => {
    await endSession.mutateAsync(session._id);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }
    await cancelSession.mutateAsync(session._id);
  };

  const handleCopyLink = () => {
    if (session.meetingLink) {
      navigator.clipboard.writeText(session.meetingLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isScheduled = session.status === 'scheduled';
  const isCancelled = session.status === 'cancelled';
  const isLive = session.status === 'live';
  const attendanceMarked = session.attendance && session.attendance !== 'pending';
  const showAttendance = session.canMarkAttendance && !isCancelled && !attendanceMarked;

  return (
    <>
      <Card
        className={cn(
          'transition-all',
          isCancelled && 'opacity-50',
          isLive && 'border-green-500 border-2'
        )}
      >
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Session Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-lg">
                  {session.subject?.name || 'Session'}
                </span>
                <SessionStatusBadge status={session.status} />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  {session.student?.firstname} {session.student?.lastname}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(scheduledAt, "EEE, MMM d 'at' h:mm a")} - {format(endTime, 'h:mm a')}
                </span>
                <Badge variant="outline">{session.duration} min</Badge>
              </div>

              {session.meetingLink && (
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-[200px]"
                  >
                    {session.meetingLink}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

              {session.notes && (
                <p className="text-sm text-muted-foreground italic">
                  {session.notes}
                </p>
              )}

              {/* Attendance result display */}
              {attendanceMarked && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Attendance:</span>
                  <Badge
                    variant={session.attendance === 'present' ? 'default' : 'destructive'}
                    className={session.attendance === 'present' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {session.attendance}
                  </Badge>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 lg:items-end">
              {/* Start Session button for scheduled sessions */}
              {isScheduled && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                  onClick={handleStart}
                  disabled={startSession.isPending}
                >
                  {startSession.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  Start Session
                </Button>
              )}

              {/* Live indicator and End button */}
              {isLive && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Live
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEnd}
                    disabled={endSession.isPending}
                  >
                    {endSession.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Square className="h-3 w-3 mr-1 fill-current" />
                    )}
                    End
                  </Button>
                </div>
              )}

              {/* Edit/Cancel for scheduled sessions */}
              {isScheduled && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={cancelSession.isPending}
                  >
                    {cancelSession.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Cancel
                  </Button>
                </div>
              )}

              {/* Attendance Marker */}
              {showAttendance && <AttendanceMarker session={session} />}
            </div>
          </div>
        </CardContent>
      </Card>

      <SessionEditDialog
        session={session}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
