"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  BookOpen,
  CheckCircle2,
  Trophy,
  Flame,
  BarChart3,
} from "lucide-react";

export default function ProgressPage() {
  // Mock data
  const stats = {
    overallProgress: 65,
    totalStudyHours: 124,
    streak: 7,
    completedCourses: 1,
    activeCourses: 3,
    completedLessons: 125,
    totalLessons: 192,
  };

  const courseProgress = [
    {
      id: 1,
      title: "Mathematics - Algebra",
      progress: 75,
      completedLessons: 34,
      totalLessons: 45,
      quizScore: 85,
      lastAccessed: "2 hours ago",
    },
    {
      id: 2,
      title: "Physics - Mechanics",
      progress: 45,
      completedLessons: 18,
      totalLessons: 40,
      quizScore: 78,
      lastAccessed: "1 day ago",
    },
    {
      id: 3,
      title: "Chemistry - Organic Chemistry",
      progress: 100,
      completedLessons: 38,
      totalLessons: 38,
      quizScore: 92,
      lastAccessed: "3 days ago",
    },
  ];

  const weeklyStudyHours = [
    { day: "Mon", hours: 4.5 },
    { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 5.0 },
    { day: "Thu", hours: 2.8 },
    { day: "Fri", hours: 4.0 },
    { day: "Sat", hours: 6.5 },
    { day: "Sun", hours: 3.5 },
  ];

  const maxHours = Math.max(...weeklyStudyHours.map((d) => d.hours));

  const achievements = [
    {
      id: 1,
      title: "First Course Completed",
      description: "Complete your first course",
      icon: "🎓",
      earned: true,
    },
    {
      id: 2,
      title: "7-Day Streak",
      description: "Study for 7 consecutive days",
      icon: "🔥",
      earned: true,
    },
    {
      id: 3,
      title: "Quiz Master",
      description: "Score above 90% in 5 quizzes",
      icon: "🏆",
      earned: false,
    },
    {
      id: 4,
      title: "100 Lessons",
      description: "Complete 100 lessons",
      icon: "📚",
      earned: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-bold mb-2">My Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Overall Progress
                </span>
              </div>
              <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-info" />
                <span className="text-xs text-muted-foreground">
                  Study Hours
                </span>
              </div>
              <div className="text-2xl font-bold">{stats.totalStudyHours}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <div className="text-2xl font-bold">{stats.streak} days</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="text-2xl font-bold">
                {stats.completedCourses}/{stats.activeCourses}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Study Hours */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Study Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklyStudyHours.map((data, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground w-12">
                        {data.day}
                      </span>
                      <span className="font-medium">{data.hours}h</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(data.hours / maxHours) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      achievement.earned
                        ? "bg-primary/5 border-primary/20"
                        : "opacity-50 grayscale"
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-xs font-semibold mb-1">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseProgress.map((course) => (
                <div key={course.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base mb-1">
                        {course.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {course.completedLessons}/{course.totalLessons}{" "}
                          Lessons
                        </span>
                        <span>•</span>
                        <span>Quiz Avg: {course.quizScore}%</span>
                        <span>•</span>
                        <span>{course.lastAccessed}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        course.progress === 100 ? "default" : "secondary"
                      }
                      className={
                        course.progress === 100
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {course.progress}%
                    </Badge>
                  </div>

                  <Progress value={course.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Lessons Completed
                  </span>
                  <span className="font-medium">
                    {stats.completedLessons}/{stats.totalLessons}
                  </span>
                </div>
                <Progress
                  value={(stats.completedLessons / stats.totalLessons) * 100}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average Quiz Score</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Assignment Completion
                  </span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-medium">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
