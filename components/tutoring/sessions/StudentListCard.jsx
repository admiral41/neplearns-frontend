'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import SubscriptionStatusBadge from '../SubscriptionStatusBadge';
import SubscriptionDetailPopover from './SubscriptionDetailPopover';
import SessionCreateDialog from './SessionCreateDialog';
import RecurringScheduleForm from '../recurring/RecurringScheduleForm';
import { formatDays } from '../recurring/DaySelector';
import { CalendarPlus, Eye, Repeat, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * ExpiryInfo - Displays expiry/trial end information for enrollment
 */
function ExpiryInfo({ enrollment }) {
  const { status, trialEndsAt, currentPeriodEnd } = enrollment;
  const now = new Date();

  if (status === 'trial' && trialEndsAt) {
    return (
      <p className="text-sm text-amber-600">
        Trial ends {format(new Date(trialEndsAt), 'MMM d, yyyy')}
      </p>
    );
  }

  if (status === 'active' && currentPeriodEnd) {
    const daysUntilExpiry = differenceInDays(new Date(currentPeriodEnd), now);
    if (daysUntilExpiry <= 7) {
      return (
        <p className="text-sm text-amber-600">
          Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
        </p>
      );
    }
  }

  if (status === 'expired' || status === 'expired_grace') {
    return <p className="text-sm text-red-600">Expired</p>;
  }

  return null;
}

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
 * RecurringScheduleInfo - Display existing recurring schedule on card
 */
function RecurringScheduleInfo({ schedule }) {
  if (!schedule) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
      <Repeat className="h-3 w-3" />
      <span className="flex items-center gap-1">
        {formatDays(schedule.daysOfWeek)}
      </span>
      <Clock className="h-3 w-3 ml-1" />
      <span>{formatTime(schedule.startTime)}</span>
      {schedule.isPaused && (
        <Badge variant="outline" className="text-xs">Paused</Badge>
      )}
    </div>
  );
}

/**
 * StudentListCard - Card displaying a student with subscription info and actions
 * @param {object} enrollment - Enrollment object with student, subject, status, recurringSchedule, etc.
 */
export default function StudentListCard({ enrollment }) {
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const status = enrollment.status;
  const isEligible = status === 'trial' || status === 'active';

  const studentName = enrollment.student
    ? `${enrollment.student.firstname || ''} ${enrollment.student.lastname || ''}`.trim()
    : 'Unknown Student';

  const subjectName = enrollment.subject?.name || 'Unknown Subject';
  const hasRecurringSchedule = !!enrollment.recurringSchedule;

  return (
    <>
      <Card className={cn('p-4', !isEligible && 'opacity-50')}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Student Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{studentName}</span>
              <SubscriptionStatusBadge status={status} />
              {/* INST-02: Detailed subscription view */}
              <SubscriptionDetailPopover enrollment={enrollment} />
            </div>
            <p className="text-sm text-muted-foreground">
              {enrollment.student?.email}
            </p>
            <ExpiryInfo enrollment={enrollment} />
            {/* Show recurring schedule info if exists */}
            <RecurringScheduleInfo schedule={enrollment.recurringSchedule} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={!isEligible}
              onClick={() => setSessionDialogOpen(true)}
            >
              <CalendarPlus className="h-4 w-4 mr-1" />
              Schedule
            </Button>
            <Button
              variant={hasRecurringSchedule ? 'ghost' : 'outline'}
              size="sm"
              disabled={!isEligible}
              onClick={() => setRecurringDialogOpen(true)}
            >
              <Repeat className="h-4 w-4 mr-1" />
              {hasRecurringSchedule ? 'Edit Recurring' : 'Set Recurring'}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/instructor-dashboard/tutoring/sessions?student=${enrollment.student?._id}`}
              >
                <Eye className="h-4 w-4 mr-1" />
                Sessions
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Session Create Dialog */}
      <SessionCreateDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        enrollment={enrollment}
        onSuccess={() => setSessionDialogOpen(false)}
      />

      {/* Recurring Schedule Dialog */}
      <Dialog open={recurringDialogOpen} onOpenChange={setRecurringDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recurring Schedule</DialogTitle>
            <DialogDescription>
              Set up automatic weekly sessions for this student
            </DialogDescription>
          </DialogHeader>
          <RecurringScheduleForm
            enrollmentId={enrollment.enrollmentId || enrollment._id}
            studentName={studentName}
            subjectName={subjectName}
            onSuccess={() => setRecurringDialogOpen(false)}
            onCancel={() => setRecurringDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
