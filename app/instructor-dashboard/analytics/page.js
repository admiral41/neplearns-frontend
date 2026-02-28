"use client";

import { useState } from "react";
import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  BookOpen,
  GraduationCap,
  Video,
} from "lucide-react";
import { useInstructorAnalytics } from "@/lib/hooks/useInstructor";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30days");
  const { data: analyticsData, isLoading } = useInstructorAnalytics(period);

  const stats = analyticsData?.data?.stats || {};
  const courses = analyticsData?.data?.courses || [];
  const enrollmentTrends = analyticsData?.data?.enrollmentTrends || [];

  const StatCard = ({ title, value, icon: Icon, prefix = "", suffix = "", loading }) => {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20 mb-1" />
          ) : (
            <p className="text-2xl font-bold">
              {prefix}
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{title}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your performance and engagement
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents || 0}
            icon={Users}
            loading={isLoading}
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue || 0}
            icon={DollarSign}
            prefix="Rs. "
            loading={isLoading}
          />
          <StatCard
            title="Active Courses"
            value={stats.totalCourses || 0}
            icon={BookOpen}
            loading={isLoading}
          />
          <StatCard
            title="Tutoring Sessions"
            value={stats.completedSessions || 0}
            icon={Video}
            loading={isLoading}
          />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm">Course Sales</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="font-medium">Rs. {(stats.courseRevenue || 0).toLocaleString()}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-sm">Private Tutoring</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="font-medium">Rs. {(stats.tutoringRevenue || 0).toLocaleString()}</span>
                )}
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  <span className="font-bold text-primary">Rs. {(stats.totalRevenue || 0).toLocaleString()}</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Student Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm">Course Students</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="font-medium">{stats.courseStudents || 0}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-sm">Tutoring Students</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="font-medium">{stats.tutoringStudents || 0}</span>
                )}
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-12" />
                ) : (
                  <span className="font-bold text-primary">{stats.totalStudents || 0}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-32 flex items-end justify-between gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <Skeleton key={i} className="flex-1 h-16" />
                  ))}
                </div>
              ) : enrollmentTrends.length > 0 ? (
                <div className="h-32 flex items-end justify-between gap-1">
                  {enrollmentTrends.map((day, index) => {
                    const maxCount = Math.max(...enrollmentTrends.map(d => d.count), 1);
                    const height = (day.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary rounded-t transition-all"
                          style={{
                            height: `${Math.max(height, 4)}%`,
                          }}
                          title={`${day.count} enrollments`}
                        />
                        <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                          {day.date.split(' ')[1]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                  No enrollment data
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No courses yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Course</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Students</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Revenue</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Avg Progress</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} className="border-b last:border-0">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-sm">{course.title}</span>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4 text-sm">{course.students}</td>
                        <td className="text-center py-4 px-4 text-sm">
                          Rs. {course.revenue.toLocaleString()}
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${course.avgProgress}%` }}
                              />
                            </div>
                            <span className="text-sm">{course.avgProgress}%</span>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${course.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{course.completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InstructorDashboardLayout>
  );
}
