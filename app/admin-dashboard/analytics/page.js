"use client";

import { useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Banknote,
  Download,
  Calendar,
  GraduationCap,
  UserCog,
  Star,
  Eye,
  Loader2,
} from "lucide-react";
import { useAdminAnalytics } from "@/lib/hooks/useAdmin";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("6months");

  // Fetch real analytics data
  const { data: analyticsResponse, isLoading, error } = useAdminAnalytics({ range: dateRange });
  const analytics = analyticsResponse?.data;

  const handleExport = (type) => {
    // Export functionality would go here
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load analytics</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Extract data from API response
  const userGrowthData = analytics?.userGrowth || [];
  const revenueData = analytics?.revenue || [];
  const enrollmentData = analytics?.enrollments || [];
  const topCourses = analytics?.topCourses || [];
  const topInstructors = analytics?.topInstructors || [];
  const categoryStats = analytics?.categoryStats || [];
  const summary = analytics?.summary || {};

  // Calculate max values for chart scaling
  const maxUserGrowth = Math.max(...userGrowthData.map((d) => d.students + d.instructors), 1);
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);
  const maxEnrollments = Math.max(...enrollmentData.map((d) => d.enrollments), 1);

  // Get totals from summary
  const totalStudents = summary.totalStudents || 0;
  const totalInstructors = summary.totalInstructors || 0;
  const totalEnrollments = summary.totalEnrollments || 0;
  const totalRevenue = summary.totalRevenue || 0;
  const changes = summary.changes || {};

  // Helper to render change indicator
  const renderChangeIndicator = (change) => {
    if (change === undefined || change === null) return null;
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? '+' : ''}{change}%
      </div>
    );
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Platform performance and insights
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport("full")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                {renderChangeIndicator(changes.students)}
              </div>
              <p className="text-2xl font-bold">{totalStudents.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <UserCog className="h-5 w-5 text-purple-500" />
                {renderChangeIndicator(changes.instructors)}
              </div>
              <p className="text-2xl font-bold">{totalInstructors.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Instructors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                {renderChangeIndicator(changes.enrollments)}
              </div>
              <p className="text-2xl font-bold">{totalEnrollments.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Banknote className="h-5 w-5 text-green-500" />
                {renderChangeIndicator(changes.revenue)}
              </div>
              <p className="text-2xl font-bold">
                {totalRevenue >= 100000
                  ? `Rs. ${(totalRevenue / 100000).toFixed(1)}L`
                  : `Rs. ${totalRevenue.toLocaleString()}`}
              </p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-primary rounded" />
                    <span className="text-muted-foreground">Students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span className="text-muted-foreground">Instructors</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {userGrowthData.length > 0 ? (
                <div className="h-56 flex items-end justify-between gap-2">
                  {userGrowthData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col gap-1" style={{ height: "200px" }}>
                        <div
                          className="w-full bg-primary rounded-t relative group cursor-pointer hover:bg-primary/80 transition-colors"
                          style={{
                            height: `${(item.students / maxUserGrowth) * 100}%`,
                            minHeight: item.students > 0 ? "4px" : "0",
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {item.students} students
                          </div>
                        </div>
                        <div
                          className="w-full bg-purple-500 rounded-b relative group cursor-pointer hover:bg-purple-400 transition-colors"
                          style={{
                            height: `${(item.instructors / maxUserGrowth) * 100}%`,
                            minHeight: item.instructors > 0 ? "4px" : "0",
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {item.instructors} instructors
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <div className="h-56 flex items-end justify-between gap-2">
                  {revenueData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-green-500 rounded-t relative group cursor-pointer hover:bg-green-400 transition-colors"
                        style={{
                          height: `${(item.revenue / maxRevenue) * 100}%`,
                          minHeight: item.revenue > 0 ? "20px" : "4px",
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Rs. {(item.revenue / 1000).toFixed(0)}K
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Trend */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Course Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollmentData.length > 0 ? (
              <div className="h-40 flex items-end justify-between gap-4">
                {enrollmentData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-orange-500 rounded-t relative group cursor-pointer hover:bg-orange-400 transition-colors"
                      style={{
                        height: `${(item.enrollments / maxEnrollments) * 100}%`,
                        minHeight: item.enrollments > 0 ? "20px" : "4px",
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.enrollments} enrollments
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No enrollment data available
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Top Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Top Performing Courses</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCourses.length > 0 ? (
                topCourses.map((course, index) => (
                  <div key={course.courseId || index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{course.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.students}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {course.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        Rs. {(course.revenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No course data available</p>
              )}
            </CardContent>
          </Card>

          {/* Top Instructors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Top Instructors</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topInstructors.length > 0 ? (
                topInstructors.map((instructor, index) => (
                  <div key={instructor.lecturerId || index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center font-semibold text-purple-500">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{instructor.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{instructor.courses} courses</span>
                        <span>{instructor.students} students</span>
                        {instructor.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {instructor.rating?.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        Rs. {(instructor.earnings / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No instructor data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <div className="space-y-4">
                {categoryStats.map((category) => {
                  const maxCategoryRevenue = Math.max(...categoryStats.map((c) => c.revenue), 1);
                  const percentage = (category.revenue / maxCategoryRevenue) * 100;
                  return (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {category.courses} courses
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {category.students} students
                          </span>
                          <span className="font-semibold text-green-600">
                            Rs. {(category.revenue / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
