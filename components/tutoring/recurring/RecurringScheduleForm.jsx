'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateSchedule } from '@/lib/hooks/useRecurringSchedule';
import DurationSelector from '../sessions/DurationSelector';
import DaySelector from './DaySelector';

/**
 * Generate time slots from 08:00 to 21:00 in 15-minute intervals
 */
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/**
 * Get tomorrow's date formatted as YYYY-MM-DD
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Get today's date formatted as YYYY-MM-DD
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * RecurringScheduleForm - Form for creating a recurring schedule
 * @param {string} enrollmentId - Enrollment ID to create schedule for
 * @param {string} studentName - Student's display name
 * @param {string} subjectName - Subject name
 * @param {function} onSuccess - Callback on successful creation
 * @param {function} onCancel - Callback when cancel is clicked
 */
export default function RecurringScheduleForm({
  enrollmentId,
  studentName,
  subjectName,
  onSuccess,
  onCancel,
}) {
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [startDate, setStartDate] = useState(getTomorrowDate());

  const createSchedule = useCreateSchedule();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (daysOfWeek.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    if (!startTime) {
      toast.error('Please select a start time');
      return;
    }

    if (!duration || duration < 15 || duration > 180) {
      toast.error('Duration must be between 15 and 180 minutes');
      return;
    }

    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    // Validate start date is not in the past
    const today = getTodayDate();
    if (startDate < today) {
      toast.error('Start date cannot be in the past');
      return;
    }

    try {
      await createSchedule.mutateAsync({
        enrollmentId,
        daysOfWeek,
        startTime,
        duration,
        startDate,
      });

      // Reset form
      setDaysOfWeek([]);
      setStartTime('');
      setDuration(60);
      setStartDate(getTomorrowDate());

      onSuccess?.();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-lg">Set Recurring Schedule</h3>
        <p className="text-sm text-muted-foreground">
          {studentName} - {subjectName}
        </p>
      </div>

      {/* Day Selection */}
      <DaySelector value={daysOfWeek} onChange={setDaysOfWeek} />

      {/* Time Selection */}
      <div className="space-y-2">
        <Label>Start Time</Label>
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration Selection */}
      <DurationSelector value={duration} onChange={setDuration} />

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Input
          type="date"
          value={startDate}
          min={getTodayDate()}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Sessions will be auto-generated 2 weeks ahead from this date
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createSchedule.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            createSchedule.isPending ||
            daysOfWeek.length === 0 ||
            !startTime
          }
        >
          {createSchedule.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Schedule'
          )}
        </Button>
      </div>
    </form>
  );
}
