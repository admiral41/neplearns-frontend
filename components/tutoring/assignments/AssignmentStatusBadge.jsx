'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    label: 'Active',
  },
  submitted: {
    variant: 'default',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    label: 'Submitted',
  },
  revision_requested: {
    variant: 'default',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    label: 'Changes Requested',
  },
  reviewed: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
    label: 'Reviewed',
  },
  overdue: {
    variant: 'default',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
    label: 'Overdue',
  },
};

/**
 * AssignmentStatusBadge - Displays colored badge for assignment status
 * @param {string} status - 'active' | 'submitted' | 'reviewed'
 * @param {string} dueDate - ISO date string (optional)
 * @param {boolean} hasSubmission - Whether a submission exists
 */
export default function AssignmentStatusBadge({ status, dueDate, hasSubmission }) {
  // Compute overdue client-side
  const isOverdue =
    status === 'active' &&
    dueDate &&
    !hasSubmission &&
    new Date() > new Date(dueDate);

  const key = isOverdue ? 'overdue' : status;
  const config = statusConfig[key] || statusConfig.active;

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
