'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardList,
  Users,
  Calendar,
  Clock
} from 'lucide-react';
import { useTutoringMetrics } from '@/lib/hooks/useAdmin';

/**
 * Admin dashboard tutoring metrics cards
 * Shows: pending requests, active subscriptions, today's sessions, upcoming sessions
 */
export default function TutoringMetricsCards() {
  const { data: metrics, isLoading, error } = useTutoringMetrics();

  if (error) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Failed to load tutoring metrics
      </div>
    );
  }

  const cards = [
    {
      label: 'Pending Requests',
      value: metrics?.pendingRequests ?? 0,
      icon: ClipboardList,
      href: '/admin-dashboard/tutoring-requests?status=pending',
    },
    {
      label: 'Active Subscriptions',
      value: metrics?.activeSubscriptions ?? 0,
      icon: Users,
      href: '/admin-dashboard/tutoring-subscriptions?status=active',
    },
    {
      label: "Today's Sessions",
      value: metrics?.todaySessions ?? 0,
      icon: Calendar,
      href: '/admin-dashboard/tutoring-sessions?date=today',
    },
    {
      label: 'Upcoming Sessions',
      value: metrics?.upcomingSessions ?? 0,
      icon: Clock,
      href: '/admin-dashboard/tutoring-sessions',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {card.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
