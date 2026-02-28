'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DurationSelector from './DurationSelector';
import { useUpdateSession } from '@/lib/hooks/useTutoringSession';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Generate time slots from 08:00 to 21:00 in 15-minute intervals
 */
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 21; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

/**
 * SessionEditDialog - Modal for editing an existing tutoring session
 * @param {object} session - Session object to edit
 * @param {boolean} open - Whether dialog is open
 * @param {function} onOpenChange - Callback when open state changes
 * @param {function} onSuccess - Callback on successful update
 */
export default function SessionEditDialog({ session, open, onOpenChange, onSuccess }) {
  const updateSession = useUpdateSession();

  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize form when session changes
  useEffect(() => {
    if (session) {
      const date = new Date(session.scheduledAt);
      setScheduledDate(date);
      setScheduledTime(format(date, 'HH:mm'));
      setDuration(session.duration || 60);
      setMeetingLink(session.meetingLink || '');
      setNotes(session.notes || '');
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduledDate || !scheduledTime) {
      return;
    }

    // Combine date and time
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const combined = new Date(scheduledDate);
    combined.setHours(hours, minutes, 0, 0);

    await updateSession.mutateAsync({
      id: session._id,
      scheduledAt: combined.toISOString(),
      duration,
      meetingLink: meetingLink || undefined,
      notes: notes || undefined,
    });

    onSuccess?.();
    onOpenChange(false);
  };

  if (!session) return null;

  const isEditable = session.status === 'scheduled';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Session - {session.subject?.name}
          </DialogTitle>
        </DialogHeader>

        {!isEditable ? (
          <p className="text-center py-4 text-muted-foreground">
            Cannot edit a {session.status} session.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Info */}
            <div className="text-sm text-muted-foreground">
              Student: {session.student?.firstname} {session.student?.lastname}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !scheduledDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
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

            {/* Duration */}
            <DurationSelector value={duration} onChange={setDuration} />

            {/* Meeting Link */}
            <div className="space-y-2">
              <Label>Meeting Link (optional)</Label>
              <Input
                type="url"
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any notes for this session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateSession.isPending}>
                {updateSession.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
