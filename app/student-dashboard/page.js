"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import EnrolledModules from "@/components/dashboard/EnrolledModules";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Announcements from "@/components/dashboard/Announcements";
import LiveClasses from "@/components/dashboard/LiveClasses";
import Assignments from "@/components/dashboard/Assignments";
import TodaysTutoringSessions from "@/components/dashboard/TodaysTutoringSessions";
import { BookOpen, Clock, Trophy, TrendingUp } from "lucide-react";
import { useUser } from "@/lib/hooks/useAuth";
import { courseAPI } from "@/lib/api/courses";

export default function StudentDashboard() {
  const { data: user } = useUser();
  const firstName = user?.firstname || "Student";

  const [stats, setStats] = useState({
    enrolledCourses: 0,
    studyHours: 0,
    completedLessons: 0,
    avgProgress: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await courseAPI.getMyCourses('enrolled');
      const courses = response.data || [];

      // Calculate stats from enrolled courses
      const totalCourses = courses.length;
      const totalStudyHours = courses.reduce((sum, c) => sum + (c.totalTimeSpent || 0), 0) / 60; // Convert minutes to hours
      const totalCompletedLessons = courses.reduce((sum, c) => sum + (c.completedLessons || 0), 0);
      const avgProgress = totalCourses > 0
        ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
        : 0;

      setStats({
        enrolledCourses: totalCourses,
        studyHours: totalStudyHours.toFixed(1),
        completedLessons: totalCompletedLessons,
        avgProgress: avgProgress
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Main Content */}
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold mb-1">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your progress and continue learning
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            icon={BookOpen}
            label="Enrolled Courses"
            value={isLoadingStats ? "..." : stats.enrolledCourses}
          />
          <StatsCard
            icon={Clock}
            label="Study Hours"
            value={isLoadingStats ? "..." : stats.studyHours}
          />
          <StatsCard
            icon={Trophy}
            label="Lessons Done"
            value={isLoadingStats ? "..." : stats.completedLessons}
          />
          <StatsCard
            icon={TrendingUp}
            label="Avg. Progress"
            value={isLoadingStats ? "..." : `${stats.avgProgress}%`}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Takes 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <LiveClasses />
            <TodaysTutoringSessions />
            <Assignments />
            <EnrolledModules />
          </div>

          {/* Right Column - Takes 1/3 on large screens */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <Announcements />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
