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
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateSession } from '@/lib/hooks/useTutoringSession';
import DurationSelector from './DurationSelector';

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
 * Combine date and time string into ISO string
 */
function combineDateAndTime(date, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

/**
 * SessionCreateDialog - Modal for creating a new tutoring session
 * @param {boolean} open - Whether dialog is open
 * @param {function} onOpenChange - Callback when open state changes
 * @param {object} enrollment - Enrollment object with _id, student, subject
 * @param {function} onSuccess - Callback on successful creation
 */
export default function SessionCreateDialog({
  open,
  onOpenChange,
  enrollment,
  onSuccess,
}) {
  const [scheduledDate, setScheduledDate] = useState(undefined);
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');

  const createSession = useCreateSession();

  const handleSubmit = async () => {
    // Only validate required fields - meetingLink is OPTIONAL per CONTEXT.md
    if (!scheduledDate || !scheduledTime || !duration) {
      toast.error('Please select date, time, and duration');
      return;
    }

    if (duration < 15 || duration > 180) {
      toast.error('Duration must be between 15 and 180 minutes');
      return;
    }

    const scheduledAt = combineDateAndTime(scheduledDate, scheduledTime);

    try {
      await createSession.mutateAsync({
        enrollmentId: enrollment.enrollmentId || enrollment._id,
        scheduledAt,
        duration,
        // meetingLink is optional - send only if provided
        ...(meetingLink.trim() && { meetingLink: meetingLink.trim() }),
      });

      // Reset form
      setScheduledDate(undefined);
      setScheduledTime('');
      setDuration(60);
      setMeetingLink('');

      onSuccess?.();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Reset form when closing
      setScheduledDate(undefined);
      setScheduledTime('');
      setDuration(60);
      setMeetingLink('');
    }
    onOpenChange(newOpen);
  };

  // Disable past dates
  const disablePastDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const studentName = enrollment?.student
    ? `${enrollment.student.firstname || ''} ${enrollment.student.lastname || ''}`.trim()
    : 'Student';
  const subjectName = enrollment?.subject?.name || 'Subject';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Session</DialogTitle>
          <DialogDescription>
            {studentName} - {subjectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={disablePastDates}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={scheduledTime} onValueChange={setScheduledTime}>
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

          {/* Meeting Link (Optional) */}
          <div className="space-y-2">
            <Label>Meeting Link</Label>
            <Input
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional - can be added later
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createSession.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSession.isPending || !scheduledDate || !scheduledTime}
          >
            {createSession.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Session'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
