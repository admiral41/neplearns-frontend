"use client";

import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentPayments from "@/components/admin/RecentPayments";
import PendingApplications from "@/components/admin/PendingApplications";
import PendingCourses from "@/components/admin/PendingCourses";
import SystemActivityFeed from "@/components/admin/SystemActivityFeed";
import QuickActions from "@/components/admin/QuickActions";
import TutoringMetricsCards from "@/components/admin/tutoring/TutoringMetricsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Activity, TrendingUp, Ban, GraduationCap } from "lucide-react";
import { useAdminDashboard } from "@/lib/hooks/useAdmin";

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useAdminDashboard();

  const stats = dashboardData?.data || {};
  const users = stats.users || {};
  const courses = stats.courses || {};
  const applications = stats.applications || {};

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            icon={Users}
            label="Total Users"
            value={isLoading ? "..." : users.total?.toLocaleString() || "0"}
            trend={users.newThisMonth ? `+${users.newThisMonth} this month` : null}
          />
          <StatsCard
            icon={BookOpen}
            label="Total Courses"
            value={isLoading ? "..." : courses.total?.toLocaleString() || "0"}
            trend={courses.pendingApproval ? `${courses.pendingApproval} pending` : null}
          />
          <StatsCard
            icon={Users}
            label="Students"
            value={isLoading ? "..." : users.students?.toLocaleString() || "0"}
            trend={`${users.instructors || 0} instructors`}
          />
          <StatsCard
            icon={Activity}
            label="Pending Applications"
            value={isLoading ? "..." : applications.pending?.toLocaleString() || "0"}
            trend={users.suspended ? `${users.suspended} suspended` : null}
          />
        </div>

        {/* Private Tutoring Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 sm:mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            Private Tutoring
          </h2>
          <TutoringMetricsCards />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Ban className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Not Available</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Revenue analytics coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <RecentPayments />

            {/* Pending Courses */}
            <PendingCourses />
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <QuickActions />

            {/* Pending Applications */}
            <PendingApplications />

            {/* System Activity Feed */}
            <SystemActivityFeed />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
