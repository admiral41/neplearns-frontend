'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { useEarningsSummary } from '@/lib/hooks/useTutoringEarnings';

/**
 * Format amount as Nepali Rupees
 */
function formatNPR(amount) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * EarningsSummaryCard - Dashboard card showing quick earnings summary
 * Shows current month earnings and total earnings with link to full earnings page
 */
export default function EarningsSummaryCard() {
  const { data, isLoading, isError } = useEarningsSummary();

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Tutoring Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load earnings</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Tutoring Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const { currentMonth, total, lastUpdated } = data;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Tutoring Earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* This Month */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p className="text-2xl font-bold text-green-600">
            {formatNPR(currentMonth?.netAmount || 0)}
          </p>
        </div>

        {/* All Time */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">All Time</p>
          <p className="text-lg font-semibold flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            {formatNPR(total?.netAmount || 0)}
          </p>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last payment: {new Date(lastUpdated).toLocaleDateString()}
          </p>
        )}

        {/* Link to full page */}
        <Link
          href="/instructor-dashboard/tutoring/earnings"
          className="flex items-center text-sm text-primary hover:underline mt-2"
        >
          View details
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
}
