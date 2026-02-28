"use client";

import InstructorDashboardLayout from "@/components/instructor/InstructorDashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import InstructorCoursesList from "@/components/instructor/InstructorCoursesList";
import RecentEnrollments from "@/components/instructor/RecentEnrollments";
import UpcomingClasses from "@/components/instructor/UpcomingClasses";
import PendingAssignments from "@/components/instructor/PendingAssignments";
import InstructorAnnouncements from "@/components/instructor/InstructorAnnouncements";
import EarningsSummaryCard from "@/components/instructor/tutoring/EarningsSummaryCard";
import TodaysTutoringSessions from "@/components/instructor/TodaysTutoringSessions";
import { BookOpen, Users, Video, Clock } from "lucide-react";
import {
  useInstructorCourses,
  useInstructorLiveClasses,
  useStartLiveClass,
  useInstructorProfile,
} from "@/lib/hooks/useInstructor";

export default function InstructorDashboard() {
  // Use instructor profile hook (same as profile page)
  const { data: profileData } = useInstructorProfile();
  const user = profileData?.data || profileData;
  const firstName = user?.firstname || "Instructor";

  // Fetch instructor's courses
  const { data: coursesData, isLoading: coursesLoading } = useInstructorCourses();

  // Fetch upcoming live classes
  const { data: liveClassesData, isLoading: liveClassesLoading } = useInstructorLiveClasses({
    status: "upcoming",
  });

  // Start live class mutation
  const startLiveClass = useStartLiveClass();

  // Extract data from responses
  const courses = coursesData?.data || [];
  const liveClasses = liveClassesData?.data || [];

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(
    (c) => c.status === "published" || c.status === "approved"
  ).length;
  const pendingCourses = courses.filter((c) => c.status === "pending_approval").length;
  const upcomingClassesCount = liveClasses.length;

  // Calculate total students (sum of enrolledCount from all courses)
  const totalStudents = courses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0);

  const handleStartClass = async (classId) => {
    try {
      const result = await startLiveClass.mutateAsync(classId);
      if (result?.meetingUrl) {
        window.open(result.meetingUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to start class:", error);
    }
  };

  return (
    <InstructorDashboardLayout>
      {/* Main Content */}
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold mb-1">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your courses and track student progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            icon={BookOpen}
            label="Total Courses"
            value={coursesLoading ? "-" : totalCourses.toString()}
            trend={publishedCourses > 0 ? `${publishedCourses} published` : null}
          />
          <StatsCard
            icon={Users}
            label="Total Students"
            value={coursesLoading ? "-" : totalStudents.toString()}
          />
          <StatsCard
            icon={Clock}
            label="Pending Approval"
            value={coursesLoading ? "-" : pendingCourses.toString()}
          />
          <StatsCard
            icon={Video}
            label="Upcoming Classes"
            value={liveClassesLoading ? "-" : upcomingClassesCount.toString()}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Takes 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <TodaysTutoringSessions />
            <InstructorCoursesList courses={courses} isLoading={coursesLoading} />
            <PendingAssignments />
            <UpcomingClasses
              liveClasses={liveClasses}
              isLoading={liveClassesLoading}
              onStartClass={handleStartClass}
            />
          </div>

          {/* Right Column - Takes 1/3 on large screens */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <EarningsSummaryCard />
            <InstructorAnnouncements />
            <RecentEnrollments />
          </div>
        </div>
      </div>
    </InstructorDashboardLayout>
  );
}
