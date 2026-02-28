"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInstructorSessions,
  useStartSession,
  useEndSession,
} from "@/lib/hooks/useTutoringSession";
import { format, startOfDay, endOfDay } from "date-fns";
import {
  Clock,
  User,
  Video,
  Calendar,
  ArrowRight,
  Play,
  Square,
  Loader2,
} from "lucide-react";

/**
 * TodaysTutoringSessions (Instructor) - Shows instructor's tutoring sessions for today + any live sessions
 * Displays on instructor dashboard with start/join buttons
 */
export default function TodaysTutoringSessions() {
  const today = new Date();

  // Fetch today's sessions
  const { data: todaySessions, isLoading: loadingToday } =
    useInstructorSessions({
      startDate: startOfDay(today).toISOString(),
      endDate: endOfDay(today).toISOString(),
    });

  // Fetch all live sessions (regardless of date)
  const { data: liveSessions, isLoading: loadingLive } = useInstructorSessions({
    status: "live",
  });

  const isLoading = loadingToday || loadingLive;

  // Combine and deduplicate sessions
  const { allLiveSessions, scheduledSessions } = useMemo(() => {
    const todaysList = todaySessions || [];
    const liveList = liveSessions || [];

    // Get all live sessions (deduplicated)
    const liveIds = new Set(liveList.map((s) => s._id));
    const allLive = [...liveList];

    // Add any live sessions from today that weren't in the live query
    todaysList.forEach((s) => {
      if (s.status === "live" && !liveIds.has(s._id)) {
        allLive.push(s);
      }
    });

    // Get scheduled sessions for today (excluding cancelled/completed)
    const scheduled = todaysList.filter((s) => s.status === "scheduled");

    return {
      allLiveSessions: allLive,
      scheduledSessions: scheduled,
    };
  }, [todaySessions, liveSessions]);

  const hasAnySessions =
    allLiveSessions.length > 0 || scheduledSessions.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Today's Tutoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Today's Tutoring
          </CardTitle>
          <Link href="/instructor-dashboard/tutoring/sessions">
            <Button variant="ghost" size="sm" className="text-xs">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!hasAnySessions ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No tutoring sessions scheduled for today
            </p>
            <Link href="/instructor-dashboard/tutoring/sessions">
              <Button variant="link" size="sm" className="mt-2">
                Manage sessions
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live/Running Sessions - from any day */}
            {allLiveSessions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Happening Now
                  </span>
                </div>
                {allLiveSessions.map((session) => (
                  <SessionCard key={session._id} session={session} />
                ))}
              </div>
            )}

            {/* Upcoming Scheduled Sessions for Today */}
            {scheduledSessions.length > 0 && (
              <div className="space-y-2">
                {allLiveSessions.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Today's Schedule
                  </span>
                )}
                {scheduledSessions.map((session) => (
                  <SessionCard key={session._id} session={session} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SessionCard({ session }) {
  const startSession = useStartSession();
  const endSession = useEndSession();

  const scheduledAt = new Date(session.scheduledAt);
  const endTime = new Date(scheduledAt.getTime() + session.duration * 60000);
  const studentName = session.student
    ? `${session.student.firstname || ""} ${
        session.student.lastname || ""
      }`.trim()
    : "Student";

  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";

  const handleStart = async () => {
    await startSession.mutateAsync(session._id);
  };

  const handleEnd = async () => {
    await endSession.mutateAsync(session._id);
  };

  return (
    <div
      className={`p-3 border rounded-lg transition-colors ${
        isLive
          ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
          : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">
              {session.subject?.name || "Tutoring Session"}
            </span>
            {isLive && (
              <Badge className="bg-green-500 text-white text-xs px-1.5 py-0">
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                Live
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {studentName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(scheduledAt, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          {/* Start button for scheduled sessions */}
          {isScheduled && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleStart}
              disabled={startSession.isPending}
            >
              {startSession.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </>
              )}
            </Button>
          )}

          {/* Join button for live sessions with meeting link */}
          {isLive && session.meetingLink && (
            <Button size="sm" variant="outline" asChild>
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video className="h-4 w-4 mr-1" />
                Join
              </a>
            </Button>
          )}

          {/* End button for live sessions */}
          {isLive && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleEnd}
              disabled={endSession.isPending}
            >
              {endSession.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Square className="h-3 w-3 mr-1 fill-current" />
                  End
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
