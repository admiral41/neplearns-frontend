'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useStudentSessions } from '@/lib/hooks/useTutoringSession';
import SessionDetailModal from './SessionDetailModal';
import { Loader2 } from 'lucide-react';

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
 * StudentSessionCalendar - Read-only calendar view for student sessions
 * Shows sessions as color-coded events with month/week/day views.
 * Clicking an event opens the student SessionDetailModal (with Join button).
 */
export default function StudentSessionCalendar() {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedSession, setSelectedSession] = useState(null);
  const calendarRef = useRef(null);

  const { data: sessions, isLoading } = useStudentSessions({
    ...(dateRange.start && { startDate: dateRange.start }),
    ...(dateRange.end && { endDate: dateRange.end }),
  });

  // Convert sessions to FullCalendar events
  const events = useMemo(() => {
    if (!sessions) return [];
    return sessions.map((session) => {
      const status = session.status || 'scheduled';
      const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled;
      const instructorName = session.instructor
        ? `${session.instructor.firstname || ''} ${session.instructor.lastname || ''}`.trim()
        : '';
      const subjectName = session.subject?.name || 'Session';
      const title = instructorName ? `${subjectName} - ${instructorName}` : subjectName;

      return {
        id: session._id,
        title,
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
  }, [sessions]);

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

      {/* Student detail modal with Join button */}
      <SessionDetailModal
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null);
        }}
      />
    </>
  );
}
