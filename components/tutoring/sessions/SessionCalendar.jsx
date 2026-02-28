'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SessionStatusBadge from './SessionStatusBadge';
import SessionEditDialog from './SessionEditDialog';
import AttendanceMarker from './AttendanceMarker';
import { useInstructorSessions, useCancelSession, useStartSession, useEndSession } from '@/lib/hooks/useTutoringSession';
import { format } from 'date-fns';
import {
  Clock,
  User,
  BookOpen,
  Link as LinkIcon,
  Copy,
  Check,
  Pencil,
  Trash2,
  Loader2,
  Play,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Status → calendar event colors
 */
const STATUS_COLORS = {
  scheduled: { bg: '#3b82f6', border: '#2563eb' },
  live: { bg: '#22c55e', border: '#16a34a' },
  completed: { bg: '#6b7280', border: '#4b5563' },
  cancelled: { bg: '#ef4444', border: '#dc2626' },
  missed: { bg: '#f59e0b', border: '#d97706' },
};

/**
 * SessionDetailDialog - Shown when clicking a calendar event
 * Includes session info + Edit, Cancel, and Attendance actions.
 * onEdit is called to open the edit dialog (lifted to parent so it survives this dialog closing).
 */
function SessionDetailDialog({ session, open, onOpenChange, onEdit }) {
  const [copied, setCopied] = useState(false);
  const cancelSession = useCancelSession();
  const startSession = useStartSession();
  const endSession = useEndSession();

  if (!session) return null;

  const scheduledAt = new Date(session.scheduledAt);
  const endTime = new Date(scheduledAt.getTime() + session.duration * 60000);
  const studentName = session.student
    ? `${session.student.firstname || ''} ${session.student.lastname || ''}`.trim()
    : 'Unknown Student';

  const isScheduled = session.status === 'scheduled';
  const isLive = session.status === 'live';
  const isCancelled = session.status === 'cancelled';
  const attendanceMarked = session.attendance && session.attendance !== 'pending';
  const showAttendanceMarker = session.canMarkAttendance && !isCancelled && !attendanceMarked;

  const handleCopyLink = () => {
    if (session.meetingLink) {
      navigator.clipboard.writeText(session.meetingLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = async () => {
    await startSession.mutateAsync(session._id);
    onOpenChange(false);
  };

  const handleEnd = async () => {
    await endSession.mutateAsync(session._id);
    onOpenChange(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }
    await cancelSession.mutateAsync(session._id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {session.subject?.name || 'Session'}
            <SessionStatusBadge status={session.status} />
          </DialogTitle>
          <DialogDescription>Session details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{studentName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {format(scheduledAt, "EEE, MMM d 'at' h:mm a")} -{' '}
              {format(endTime, 'h:mm a')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{session.duration} minutes</span>
          </div>

          {session.meetingLink && (
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate max-w-[200px]"
              >
                Join Meeting
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
            <p className="text-sm text-muted-foreground italic border-l-2 pl-3">
              {session.notes}
            </p>
          )}

          {/* Attendance already marked — show result */}
          {attendanceMarked && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Attendance:</span>
              <Badge
                variant={session.attendance === 'present' ? 'default' : 'destructive'}
                className={
                  session.attendance === 'present'
                    ? 'bg-green-100 text-green-800'
                    : ''
                }
              >
                {session.attendance.charAt(0).toUpperCase() + session.attendance.slice(1)}
              </Badge>
            </div>
          )}

          {/* Attendance Marker — only when pending */}
          {showAttendanceMarker && (
            <div className="pt-2 border-t">
              <AttendanceMarker session={session} />
            </div>
          )}

          {/* Start Session button for scheduled sessions */}
          {isScheduled && (
            <div className="pt-2 border-t">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
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
              <p className="text-xs text-muted-foreground text-center mt-1">
                Start early so student can join now
              </p>
            </div>
          )}

          {/* Live session actions */}
          {isLive && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Session is Live
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleEnd}
                disabled={endSession.isPending}
              >
                {endSession.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Square className="h-3 w-3 mr-1 fill-current" />
                )}
                End Session
              </Button>
            </div>
          )}

          {/* Edit / Cancel actions for scheduled sessions */}
          {isScheduled && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(session)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * SessionCalendar - Full grid calendar view for instructor sessions
 * Uses FullCalendar with month/week/day views, color-coded events, and click-to-view details.
 * @param {string} studentFilter - Student ID to filter by, or 'all'
 */
export default function SessionCalendar({ studentFilter = 'all' }) {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const calendarRef = useRef(null);

  // Fetch sessions for the visible date range
  const { data: sessions, isLoading } = useInstructorSessions({
    ...(dateRange.start && { startDate: dateRange.start }),
    ...(dateRange.end && { endDate: dateRange.end }),
  });

  // Filter by student if needed
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    if (studentFilter === 'all') return sessions;
    return sessions.filter((s) => s.student?._id === studentFilter);
  }, [sessions, studentFilter]);

  // Convert sessions to FullCalendar events
  const events = useMemo(() => {
    return filteredSessions.map((session) => {
      const status = session.status || 'scheduled';
      const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled;
      const studentName = session.student
        ? `${session.student.firstname || ''} ${session.student.lastname || ''}`.trim()
        : 'Unknown';

      return {
        id: session._id,
        title: `${studentName} - ${session.subject?.name || 'Session'}`,
        start: session.scheduledAt,
        end: new Date(
          new Date(session.scheduledAt).getTime() +
            (session.duration || 60) * 60000
        ).toISOString(),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: '#ffffff',
        extendedProps: { session },
      };
    });
  }, [filteredSessions]);

  const handleDatesSet = useCallback((dateInfo) => {
    setDateRange({
      start: dateInfo.start.toISOString(),
      end: dateInfo.end.toISOString(),
    });
  }, []);

  const handleEventClick = useCallback((clickInfo) => {
    setSelectedSession(clickInfo.event.extendedProps.session);
  }, []);

  return (
    <>
      <div className="session-calendar rounded-lg border bg-background p-2 sm:p-4">
        {isLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          datesSet={handleDatesSet}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          contentHeight="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator={true}
          weekends={true}
          slotDuration="00:30:00"
          eventDisplay="block"
          dayMaxEvents={3}
          expandRows={true}
          stickyHeaderDates={true}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
          }}
        />
      </div>

      <SessionDetailDialog
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null);
        }}
        onEdit={(session) => {
          setSelectedSession(null);
          setEditingSession(session);
        }}
      />

      {/* Edit Dialog - rendered at this level so it survives detail dialog closing */}
      <SessionEditDialog
        session={editingSession}
        open={!!editingSession}
        onOpenChange={(open) => {
          if (!open) setEditingSession(null);
        }}
      />
    </>
  );
}
