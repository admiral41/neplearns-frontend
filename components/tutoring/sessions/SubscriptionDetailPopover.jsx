'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import SubscriptionStatusBadge from '../SubscriptionStatusBadge';
import { Info } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

/**
 * SubscriptionDetailPopover - Displays detailed subscription info in a popover
 * Satisfies INST-02: "Instructor can view each student's subscription status"
 *
 * @param {object} enrollment - Enrollment object with status, trialEndsAt, currentPeriodEnd, createdAt
 */
export default function SubscriptionDetailPopover({ enrollment }) {
  const {
    status,
    trialEndsAt,
    currentPeriodEnd,
    createdAt,
  } = enrollment;

  const now = new Date();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Info className="h-4 w-4" />
          <span className="sr-only">View subscription details</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription Status</span>
            <SubscriptionStatusBadge status={status} />
          </div>

          <div className="border-t pt-3 space-y-2 text-sm">
            {/* Enrolled Date */}
            {createdAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled</span>
                <span>{format(new Date(createdAt), 'MMM d, yyyy')}</span>
              </div>
            )}

            {/* Trial Info */}
            {status === 'trial' && trialEndsAt && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trial Ends</span>
                  <span>{format(new Date(trialEndsAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className="font-medium text-amber-600">
                    {Math.max(0, differenceInDays(new Date(trialEndsAt), now))} days
                  </span>
                </div>
              </>
            )}

            {/* Active Subscription Info */}
            {status === 'active' && currentPeriodEnd && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renews On</span>
                  <span>{format(new Date(currentPeriodEnd), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Until Renewal</span>
                  <span className="font-medium">
                    {Math.max(0, differenceInDays(new Date(currentPeriodEnd), now))} days
                  </span>
                </div>
              </>
            )}

            {/* Expired/Grace Info */}
            {(status === 'expired' || status === 'expired_grace') && currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expired On</span>
                <span className="text-red-600">
                  {format(new Date(currentPeriodEnd), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            {/* Cancelled Info */}
            {status === 'cancelled' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-red-600">Cancelled</span>
              </div>
            )}

            {/* Paused Info */}
            {status === 'paused' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-gray-600">Subscription Paused</span>
              </div>
            )}

            {/* Pending Info */}
            {status === 'pending' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-yellow-600">Awaiting Activation</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
