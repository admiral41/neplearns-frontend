'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InstructorDashboardLayout from '@/components/instructor/InstructorDashboardLayout';
import {
  useInstructorSessions,
  useMyTutoringStudents,
} from '@/lib/hooks/useTutoringSession';
import InstructorSessionCard from '@/components/tutoring/sessions/InstructorSessionCard';
import AttendanceMarker from '@/components/tutoring/sessions/AttendanceMarker';
import SessionStatusBadge from '@/components/tutoring/sessions/SessionStatusBadge';
import SessionCalendar from '@/components/tutoring/sessions/SessionCalendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Calendar,
  History,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ClipboardCheck,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, addDays, isAfter, isBefore, subDays } from 'date-fns';

/**
 * AttendanceView - Shows sessions needing attendance + recent attendance history
 */
function AttendanceView({ studentFilter }) {
  // Stable date range — computed once on mount, not every render
  // Include +2 days ahead to catch sessions started early by instructor
  const [dateRange] = useState(() => ({
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: addDays(new Date(), 2).toISOString(),
  }));

  const { data: recentSessions, isLoading } = useInstructorSessions(dateRange);

  const { needsAttendance, attendanceHistory } = useMemo(() => {
    if (!recentSessions) return { needsAttendance: [], attendanceHistory: [] };

    let filtered = recentSessions;
    if (studentFilter !== 'all') {
      filtered = filtered.filter((s) => s.student?._id === studentFilter);
    }

    // Sessions where attendance can still be marked and hasn't been marked yet
    const needs = filtered.filter(
      (s) => s.canMarkAttendance && s.attendance === 'pending' && s.status !== 'cancelled'
    );

    // Sessions where attendance has been marked (most recent first)
    const history = filtered
      .filter((s) => s.attendance !== 'pending' && s.status !== 'cancelled')
      .sort((a, b) => new Date(b.attendanceMarkedAt || b.scheduledAt) - new Date(a.attendanceMarkedAt || a.scheduledAt));

    // Sort needs by most urgent first (oldest session first)
    needs.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    return { needsAttendance: needs, attendanceHistory: history };
  }, [recentSessions, studentFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Needs Attention Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Needs Attendance</h2>
          {needsAttendance.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {needsAttendance.length}
            </Badge>
          )}
        </div>

        {needsAttendance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm mt-1">No sessions need attendance marking right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {needsAttendance.map((session) => {
              const scheduledAt = new Date(session.scheduledAt);
              const endTime = new Date(scheduledAt.getTime() + session.duration * 60000);
              const studentName = session.student
                ? `${session.student.firstname || ''} ${session.student.lastname || ''}`.trim()
                : 'Unknown';

              return (
                <Card key={session._id} className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">
                            {session.subject?.name || 'Session'}
                          </span>
                          <SessionStatusBadge status={session.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{studentName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {format(scheduledAt, "EEE, MMM d 'at' h:mm a")} - {format(endTime, 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <AttendanceMarker session={session} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendance History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent History</h2>
          <span className="text-sm text-muted-foreground">(Last 30 days)</span>
        </div>

        {attendanceHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No attendance records yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attendanceHistory.map((session) => {
              const scheduledAt = new Date(session.scheduledAt);
              const studentName = session.student
                ? `${session.student.firstname || ''} ${session.student.lastname || ''}`.trim()
                : 'Unknown';
              const isPresent = session.attendance === 'present';

              return (
                <Card key={session._id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`shrink-0 rounded-full p-1.5 ${isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isPresent ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium truncate">{studentName}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-muted-foreground truncate">{session.subject?.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(scheduledAt, "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {isPresent ? 'Present' : 'Absent'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SessionsListView - The existing list view with week navigation and upcoming/past tabs
 */
function SessionsListView({ studentFilter }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const currentDate = addWeeks(new Date(), weekOffset);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const { data: sessions, isLoading, isError, error } = useInstructorSessions({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    if (studentFilter === 'all') return sessions;
    return sessions.filter((s) => s.student?._id === studentFilter);
  }, [sessions, studentFilter]);

  const now = new Date();
  const upcomingSessions = filteredSessions.filter(
    (s) => isAfter(new Date(s.scheduledAt), now) || s.status === 'live'
  );
  const pastSessions = filteredSessions.filter(
    (s) => isBefore(new Date(s.scheduledAt), now) && s.status !== 'live'
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {error?.message || 'Failed to load sessions'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset((o) => o - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[200px] text-center">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset((o) => o + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {weekOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <History className="h-4 w-4" />
            Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming sessions this week.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <InstructorSessionCard key={session._id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No past sessions this week.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <InstructorSessionCard key={session._id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * SessionsContent - Inner component that uses searchParams
 */
function SessionsContent() {
  const searchParams = useSearchParams();
  const initialStudent = searchParams.get('student') || 'all';

  const [studentFilter, setStudentFilter] = useState(initialStudent);
  const [viewMode, setViewMode] = useState('calendar');

  // Fetch students for filter dropdown
  const { data: studentsData } = useMyTutoringStudents();

  // Stable date range for attendance badge count (+2 days for early-started sessions)
  const [attendanceDateRange] = useState(() => ({
    startDate: subDays(new Date(), 30).toISOString(),
    endDate: addDays(new Date(), 2).toISOString(),
  }));
  const { data: recentSessions } = useInstructorSessions(attendanceDateRange);
  const pendingAttendanceCount = useMemo(() => {
    if (!recentSessions) return 0;
    let filtered = recentSessions;
    if (studentFilter !== 'all') {
      filtered = filtered.filter((s) => s.student?._id === studentFilter);
    }
    return filtered.filter(
      (s) => s.canMarkAttendance && s.attendance === 'pending' && s.status !== 'cancelled'
    ).length;
  }, [recentSessions, studentFilter]);

  const allStudents = useMemo(() => {
    if (!studentsData?.bySubject) return [];
    const students = [];
    Object.values(studentsData.bySubject).forEach((group) => {
      group.students?.forEach((enrollment) => {
        if (!students.find((s) => s._id === enrollment.student?._id)) {
          students.push(enrollment.student);
        }
      });
    });
    return students;
  }, [studentsData]);

  return (
    <div className="space-y-6">
      {/* Header: Title + View Toggle + Student Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-bold">My Sessions</h1>

        <div className="flex items-center gap-3">
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
            <Button
              variant={viewMode === 'attendance' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-3 gap-1.5 relative"
              onClick={() => setViewMode('attendance')}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
              {pendingAttendanceCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingAttendanceCount}
                </span>
              )}
            </Button>
          </div>

          {/* Student Filter */}
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {allStudents.map((student) => (
                <SelectItem key={student._id} value={student._id}>
                  {student.firstname} {student.lastname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'calendar' ? (
        <SessionCalendar studentFilter={studentFilter} />
      ) : viewMode === 'attendance' ? (
        <AttendanceView studentFilter={studentFilter} />
      ) : (
        <SessionsListView studentFilter={studentFilter} />
      )}
    </div>
  );
}

/**
 * InstructorSessionsPage - Wrapper with Suspense for useSearchParams
 */
export default function InstructorSessionsPage() {
  return (
    <InstructorDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <SessionsContent />
        </Suspense>
      </div>
    </InstructorDashboardLayout>
  );
}
