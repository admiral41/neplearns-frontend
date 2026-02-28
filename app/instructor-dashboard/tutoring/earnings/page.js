'use client';

import { useState } from 'react';
import InstructorDashboardLayout from '@/components/instructor/InstructorDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useEarningsSummary,
  useEarningsByStudent,
  useMonthlyEarnings,
} from '@/lib/hooks/useTutoringEarnings';
import EarningsBreakdown from '@/components/instructor/tutoring/EarningsBreakdown';

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
 * Stat Card component for summary display - shows only net earnings
 */
function StatCard({ icon: Icon, label, earnings, isLoading, trend }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { netAmount = 0 } = earnings || {};

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-green-600">{formatNPR(netAmount)}</p>
            {trend && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Tutoring Earnings Page
 * Shows summary stats and tabbed breakdown by student or month
 */
export default function TutoringEarningsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: summary, isLoading: summaryLoading } = useEarningsSummary();
  const { data: studentData, isLoading: studentLoading } = useEarningsByStudent();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyEarnings(selectedYear);

  const handlePreviousYear = () => {
    setSelectedYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear((prev) => prev + 1);
    }
  };

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Tutoring Earnings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your earnings from tutoring sessions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            label="This Month"
            earnings={summary?.currentMonth}
            isLoading={summaryLoading}
          />
          <StatCard
            icon={Wallet}
            label="All Time Total"
            earnings={summary?.total}
            isLoading={summaryLoading}
            trend={
              summary?.lastUpdated
                ? `Last payment: ${new Date(summary.lastUpdated).toLocaleDateString()}`
                : null
            }
          />
        </div>

        {/* Tabbed Breakdown */}
        <Tabs defaultValue="student" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              By Student
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            {studentLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ) : (
              <EarningsBreakdown data={studentData} type="student" />
            )}
          </TabsContent>

          <TabsContent value="monthly">
            {/* Year Selector */}
            <Card className="mb-4">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousYear}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {selectedYear - 1}
                  </Button>
                  <span className="font-semibold text-lg">{selectedYear}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextYear}
                    disabled={selectedYear >= currentYear}
                  >
                    {selectedYear + 1}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {monthlyLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ) : (
              <EarningsBreakdown data={monthlyData?.earnings} type="monthly" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </InstructorDashboardLayout>
  );
}
