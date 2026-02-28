'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useStudentSessions } from '@/lib/hooks/useTutoringSession';
import { useStudentSchedule } from '@/lib/hooks/useRecurringSchedule';
import StudentSessionCalendar from '@/components/tutoring/sessions/StudentSessionCalendar';
import SessionDetailModal from '@/components/tutoring/sessions/SessionDetailModal';
import SessionStatusBadge from '@/components/tutoring/sessions/SessionStatusBadge';
import StudentRecurringScheduleCard from '@/components/tutoring/recurring/StudentRecurringScheduleCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Calendar,
  History,
  CheckCircle,
  XCircle,
  Repeat,
  Video,
  Clock,
  User,
  LayoutGrid,
  List,
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * SessionsListView - List-based view with upcoming/history tabs
 */
function SessionsListView({ sessions }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { upcomingSessions, pastSessions } = useMemo(() => {
    const allSessions = sessions || [];
    const now = new Date();

    const upcoming = allSessions.filter(
      (s) => new Date(s.scheduledAt) >= now && s.status === 'scheduled'
    );
    const past = allSessions.filter(
      (s) =>
        s.status === 'completed' ||
        s.status === 'cancelled' ||
        (new Date(s.scheduledAt) < now && s.status !== 'scheduled')
    );

    upcoming.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    past.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

    return { upcomingSessions: upcoming, pastSessions: past };
  }, [sessions]);

  const handleCardClick = (session) => {
    setSelectedSession(session);
    setDetailOpen(true);
  };

  const getAttendanceDisplay = (attendance) => {
    if (!attendance || attendance === 'pending') return null;
    const isPresent = attendance === 'present';
    return {
      label: attendance.charAt(0).toUpperCase() + attendance.slice(1),
      className: isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      Icon: isPresent ? CheckCircle : XCircle,
    };
  };

  return (
    <>
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
            {upcomingSessions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {upcomingSessions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="mt-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No upcoming sessions</p>
              <p className="text-sm mt-1">
                Your scheduled tutoring sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => {
                const scheduledAt = new Date(session.scheduledAt);
                const endTime = new Date(scheduledAt.getTime() + session.duration * 60000);

                return (
                  <Card
                    key={session._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick(session)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {session.subject?.name || 'Tutoring Session'}
                            </span>
                            <SessionStatusBadge status={session.status} />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>
                              {session.instructor?.firstname} {session.instructor?.lastname}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {format(scheduledAt, "EEE, MMM d 'at' h:mm a")} - {format(endTime, 'h:mm a')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {session.duration} min
                            </Badge>
                          </div>
                        </div>
                        {session.canJoin && session.meetingLink && (
                          <Button
                            size="sm"
                            className="shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(session.meetingLink, '_blank');
                            }}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          {pastSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No session history</p>
              <p className="text-sm mt-1">
                Your completed and past sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastSessions.map((session) => {
                const attendanceInfo = getAttendanceDisplay(session.attendance);
                const scheduledAt = new Date(session.scheduledAt);

                return (
                  <Card
                    key={session._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick(session)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {session.subject?.name || 'Tutoring Session'}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {format(scheduledAt, "MMM d, yyyy 'at' h:mm a")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            with {session.instructor?.firstname}{' '}
                            {session.instructor?.lastname}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <SessionStatusBadge status={session.status} />
                          {attendanceInfo && (
                            <Badge className={attendanceInfo.className}>
                              <attendanceInfo.Icon className="h-3 w-3 mr-1" />
                              {attendanceInfo.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

/**
 * StudentSessionsPage - Student view of their tutoring sessions
 * Calendar/List toggle with upcoming+history tabs in list view
 */
export default function StudentSessionsPage() {
  const [viewMode, setViewMode] = useState('calendar');

  const { data: sessions, isLoading, isError, error } = useStudentSessions();
  const { data: recurringSchedules, isLoading: schedulesLoading } = useStudentSchedule();

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Failed to load sessions</div>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Please try again later.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with view toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold">My Tutoring Sessions</h1>
                <p className="text-muted-foreground mt-1">
                  View your scheduled sessions and session history
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center rounded-lg border bg-muted p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-3 gap-1.5"
                  onClick={() => setViewMode('calendar')}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-3 gap-1.5"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </div>
            </div>

            {/* Recurring Schedule Section */}
            {!schedulesLoading && recurringSchedules && recurringSchedules.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">My Weekly Schedule</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recurringSchedules.map((schedule) => (
                    <StudentRecurringScheduleCard key={schedule._id} schedule={schedule} />
                  ))}
                </div>
              </div>
            )}

            {/* View Content */}
            {viewMode === 'calendar' ? (
              <StudentSessionCalendar />
            ) : (
              <SessionsListView sessions={sessions} />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
