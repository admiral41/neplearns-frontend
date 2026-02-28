'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AdminLiveClassDetailDialog from './AdminLiveClassDetailDialog';
import { Loader2 } from 'lucide-react';

/**
 * Status → calendar event colors
 */
const STATUS_COLORS = {
  scheduled: { bg: '#3b82f6', border: '#2563eb' },
  live: { bg: '#22c55e', border: '#16a34a' },
  ended: { bg: '#6b7280', border: '#4b5563' },
  cancelled: { bg: '#ef4444', border: '#dc2626' },
};

/**
 * AdminLiveClassCalendar - Full grid calendar view for all live classes (admin view)
 * Uses FullCalendar with month/week/day views, color-coded events, and click-to-view details.
 *
 * @param {Array} liveClasses - Array of live class objects
 * @param {boolean} isLoading - Loading state
 * @param {string} courseFilter - Course ID to filter by, or 'all'
 * @param {string} instructorFilter - Instructor ID to filter by, or 'all'
 * @param {Function} onRefresh - Callback to refresh data
 */
export default function AdminLiveClassCalendar({
  liveClasses = [],
  isLoading = false,
  courseFilter = 'all',
  instructorFilter = 'all',
  onRefresh,
}) {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedLiveClass, setSelectedLiveClass] = useState(null);
  const calendarRef = useRef(null);

  // Filter by course and instructor if needed
  const filteredClasses = useMemo(() => {
    if (!liveClasses) return [];

    let filtered = liveClasses;

    if (courseFilter !== 'all') {
      filtered = filtered.filter(
        (lc) => (lc.course?._id || lc.course) === courseFilter
      );
    }

    if (instructorFilter !== 'all') {
      filtered = filtered.filter(
        (lc) => (lc.createdBy?._id || lc.createdBy) === instructorFilter
      );
    }

    return filtered;
  }, [liveClasses, courseFilter, instructorFilter]);

  // Convert live classes to FullCalendar events
  const events = useMemo(() => {
    return filteredClasses.map((liveClass) => {
      const status = liveClass.status || 'scheduled';
      const colors = STATUS_COLORS[status] || STATUS_COLORS.scheduled;
      const courseName = liveClass.course?.courseTitle || 'Course';
      const instructor = liveClass.createdBy || liveClass.instructor;
      const instructorName = instructor
        ? `${instructor.firstname || ''} ${instructor.lastname || ''}`.trim()
        : '';

      // Use the raw scheduledStartTime directly
      const startTime = liveClass.scheduledStartTime;

      // Calculate end time
      let endTime = liveClass.scheduledEndTime;
      if (!endTime && startTime) {
        const startDate = new Date(startTime);
        endTime = new Date(startDate.getTime() + 60 * 60000).toISOString();
      }

      if (!startTime) {
        console.warn('Missing start time for live class:', liveClass._id);
        return null;
      }

      // Include instructor name in title for admin view
      const title = instructorName
        ? `${courseName} - ${liveClass.title} (${instructorName})`
        : `${courseName} - ${liveClass.title}`;

      return {
        id: liveClass._id,
        title,
        start: startTime,
        end: endTime,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: '#ffffff',
        extendedProps: { liveClass },
      };
    }).filter(Boolean);
  }, [filteredClasses]);

  const handleDatesSet = useCallback((dateInfo) => {
    setDateRange({
      start: dateInfo.start.toISOString(),
      end: dateInfo.end.toISOString(),
    });
  }, []);

  const handleEventClick = useCallback((clickInfo) => {
    setSelectedLiveClass(clickInfo.event.extendedProps.liveClass);
  }, []);

  return (
    <>
      <div className="admin-live-class-calendar rounded-lg border bg-background p-2 sm:p-4">
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
          contentHeight={600}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          scrollTime="08:00:00"
          allDaySlot={false}
          nowIndicator={true}
          weekends={true}
          slotDuration="00:30:00"
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

      <AdminLiveClassDetailDialog
        liveClass={selectedLiveClass}
        open={!!selectedLiveClass}
        onOpenChange={(open) => {
          if (!open) setSelectedLiveClass(null);
        }}
      />
    </>
  );
}
