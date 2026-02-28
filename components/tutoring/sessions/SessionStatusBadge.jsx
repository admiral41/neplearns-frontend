'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
  scheduled: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  live: {
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  completed: {
    variant: 'secondary',
    className: '',
  },
  cancelled: {
    variant: 'default',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

/**
 * SessionStatusBadge - Displays colored badge for session status
 * @param {string} status - Session status: 'scheduled', 'live', 'completed', 'cancelled'
 */
export default function SessionStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.scheduled;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className)}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
