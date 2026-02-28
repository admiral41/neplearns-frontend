'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDays } from './DaySelector';
import { cn } from '@/lib/utils';

/**
 * Format time from 24h to 12h format
 * @param {string} time - Time in HH:MM format
 * @returns {string} - Formatted time like "4:00 PM"
 */
function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} duration - Duration in minutes
 * @returns {string} - End time formatted like "5:00 PM"
 */
function calculateEndTime(startTime, duration) {
  if (!startTime || !duration) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  const period = endHours >= 12 ? 'PM' : 'AM';
  const hour12 = endHours % 12 || 12;
  return `${hour12}:${endMinutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * StudentRecurringScheduleCard - Read-only card displaying a student's recurring schedule
 * No action buttons (pause/delete/update) - view only for students
 * @param {object} schedule - Recurring schedule object
 */
export default function StudentRecurringScheduleCard({ schedule }) {
  const isPaused = schedule.isPaused;

  // Extract enrollment info
  const instructorName = schedule.enrollment?.instructor
    ? `${schedule.enrollment.instructor.firstname || ''} ${schedule.enrollment.instructor.lastname || ''}`.trim()
    : 'Unknown Instructor';
  const subjectName = schedule.enrollment?.subject?.name || 'Unknown Subject';

  return (
    <Card className={cn('p-4', isPaused && 'opacity-70')}>
      <div className="space-y-3">
        {/* Instructor and Subject Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{instructorName}</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-sm text-muted-foreground">{subjectName}</span>
        </div>

        {/* Days of Week */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1 flex-wrap">
            {(schedule.daysOfWeek || []).map((day) => (
              <Badge key={day} variant="secondary" className="text-xs">
                {formatDays([day])}
              </Badge>
            ))}
          </div>
        </div>

        {/* Time and Duration */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(schedule.startTime)} - {calculateEndTime(schedule.startTime, schedule.duration)}
          </span>
          <span>({schedule.duration} min)</span>
        </div>

        {/* Status Badge */}
        <div>
          <Badge variant={isPaused ? 'outline' : 'default'}>
            {isPaused ? 'Paused' : 'Active'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
