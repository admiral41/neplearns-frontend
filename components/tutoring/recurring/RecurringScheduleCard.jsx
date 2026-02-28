'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pause, Play, Trash2, Calendar, Clock, Loader2 } from 'lucide-react';
import { useUpdateSchedule, useDeleteSchedule } from '@/lib/hooks/useRecurringSchedule';
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
 * RecurringScheduleCard - Card displaying a recurring schedule with controls
 * @param {object} schedule - Recurring schedule object
 * @param {boolean} showStudentInfo - Whether to show student/subject info (default: true)
 */
export default function RecurringScheduleCard({ schedule, showStudentInfo = true }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const isPaused = schedule.isPaused;
  const isLoading = updateSchedule.isPending || deleteSchedule.isPending;

  const handleTogglePause = async () => {
    await updateSchedule.mutateAsync({
      id: schedule._id,
      data: { isPaused: !isPaused },
    });
  };

  const handleDelete = async () => {
    await deleteSchedule.mutateAsync(schedule._id);
    setDeleteDialogOpen(false);
  };

  // Extract enrollment info
  const studentName = schedule.enrollment?.student
    ? `${schedule.enrollment.student.firstname || ''} ${schedule.enrollment.student.lastname || ''}`.trim()
    : 'Unknown Student';
  const subjectName = schedule.enrollment?.subject?.name || 'Unknown Subject';

  return (
    <Card className={cn('p-4', isPaused && 'opacity-70')}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Schedule Info */}
        <div className="space-y-2 flex-1">
          {showStudentInfo && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{studentName}</span>
              <span className="text-sm text-muted-foreground">-</span>
              <span className="text-sm text-muted-foreground">{subjectName}</span>
            </div>
          )}

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
          <div className="flex items-center gap-2">
            <Badge variant={isPaused ? 'outline' : 'default'}>
              {isPaused ? 'Paused' : 'Active'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Sessions auto-generated 2 weeks ahead
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePause}
            disabled={isLoading}
          >
            {updateSchedule.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPaused ? (
              <>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            )}
          </Button>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Recurring Schedule</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this recurring schedule?
                  Future sessions will no longer be automatically generated.
                  Existing sessions will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteSchedule.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
