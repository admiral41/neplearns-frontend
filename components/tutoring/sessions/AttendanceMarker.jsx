'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMarkAttendance } from '@/lib/hooks/useTutoringSession';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AttendanceMarker - UI for marking student attendance as present/absent
 * @param {object} session - Session object with _id, attendance, canMarkAttendance
 * @param {function} onSuccess - Callback after successfully marking attendance
 */
export default function AttendanceMarker({ session, onSuccess }) {
  const markAttendance = useMarkAttendance();
  const [marking, setMarking] = useState(null);

  const handleMark = async (attendance) => {
    setMarking(attendance);
    try {
      await markAttendance.mutateAsync({ id: session._id, attendance });
      onSuccess?.();
    } finally {
      setMarking(null);
    }
  };

  const currentAttendance = session.attendance;
  const isAlreadyMarked = currentAttendance && currentAttendance !== 'pending';
  const isDisabled = !session.canMarkAttendance || markAttendance.isPending || isAlreadyMarked;

  // If already marked, show the result instead of buttons
  if (isAlreadyMarked) {
    const isPresent = currentAttendance === 'present';
    return (
      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">Attendance Marked</span>
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
          isPresent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}>
          {isPresent ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          {isPresent ? 'Present' : 'Absent'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-sm text-muted-foreground">Mark Attendance</span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
          disabled={isDisabled}
          onClick={() => handleMark('present')}
        >
          {marking === 'present' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          Present
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          disabled={isDisabled}
          onClick={() => handleMark('absent')}
        >
          {marking === 'absent' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4 mr-1" />
          )}
          Absent
        </Button>
      </div>
      {!session.canMarkAttendance && currentAttendance === 'pending' && (
        <p className="text-xs text-muted-foreground">
          Attendance can be marked from session start through 24h after.
        </p>
      )}
    </div>
  );
}
