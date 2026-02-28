"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Video,
} from "lucide-react";
import { useAdminTutoringSessions } from "@/lib/hooks/useAdmin";

// Date filter options
const DATE_FILTERS = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
];

// Status filter options
const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// Status badge styling
const statusConfig = {
  scheduled: { label: "Scheduled", variant: "default", icon: Clock },
  live: { label: "Live", variant: "secondary", icon: Video },
  completed: { label: "Completed", variant: "outline", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

function AdminTutoringSessionsContent() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") || "all";
  const initialStatus = searchParams.get("status") || "all";

  // Filter state
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync filters with URL params on mount
  useEffect(() => {
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    if (date && DATE_FILTERS.some((d) => d.value === date)) {
      setDateFilter(date);
    }
    if (status && STATUS_FILTERS.some((s) => s.value === status)) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  // Fetch sessions with server-side date filter
  const { data, isLoading, isError, error, refetch } = useAdminTutoringSessions({
    date: dateFilter !== "all" ? dateFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const sessions = data?.sessions || [];
  const pagination = data?.pagination || { total: 0 };

  // Client-side search filter
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;

    const query = searchQuery.toLowerCase();
    return sessions.filter((session) => {
      const studentName = session.student
        ? `${session.student.firstname || ""} ${session.student.lastname || ""}`.toLowerCase()
        : "";
      const instructorName = session.instructor
        ? `${session.instructor.firstname || ""} ${session.instructor.lastname || ""}`.toLowerCase()
        : "";
      const subjectName = session.subject?.name?.toLowerCase() || "";
      return (
        studentName.includes(query) ||
        instructorName.includes(query) ||
        subjectName.includes(query)
      );
    });
  }, [sessions, searchQuery]);

  // Format session time
  const formatSessionTime = (scheduledAt, duration) => {
    if (!scheduledAt) return "-";
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              Tutoring Sessions
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View and manage all scheduled tutoring sessions
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or instructor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Filter */}
          <Tabs value={dateFilter} onValueChange={setDateFilter} className="flex-shrink-0">
            <TabsList>
              {DATE_FILTERS.map(({ value, label }) => (
                <TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Status Filter */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex-shrink-0">
            <TabsList>
              {STATUS_FILTERS.map(({ value, label }) => (
                <TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results Count */}
        {!isLoading && !isError && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredSessions.length} of {pagination.total} sessions
          </p>
        )}

        {/* Content */}
        <Card>
          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Failed to load sessions
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {error?.message || "An error occurred while fetching sessions."}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Sessions Table */}
            {!isLoading && !isError && filteredSessions.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const status = statusConfig[session.status] || statusConfig.scheduled;
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={session._id}>
                        <TableCell className="font-medium">
                          {session.scheduledAt
                            ? format(new Date(session.scheduledAt), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {formatSessionTime(session.scheduledAt, session.duration)}
                        </TableCell>
                        <TableCell>
                          {session.student
                            ? `${session.student.firstname || ""} ${session.student.lastname || ""}`.trim()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {session.instructor
                            ? `${session.instructor.firstname || ""} ${session.instructor.lastname || ""}`.trim()
                            : "-"}
                        </TableCell>
                        <TableCell>{session.subject?.name || "-"}</TableCell>
                        <TableCell>{session.duration} min</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {session.status === "cancelled" ? (
                            <span className="text-muted-foreground">-</span>
                          ) : session.attendance === "present" ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Present
                            </Badge>
                          ) : session.attendance === "absent" ? (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Absent
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredSessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery
                    ? "No matching sessions"
                    : dateFilter !== "all" || statusFilter !== "all"
                      ? "No sessions found"
                      : "No sessions yet"}
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery
                    ? "Try adjusting your search criteria."
                    : dateFilter !== "all" || statusFilter !== "all"
                      ? "Try changing your filter settings."
                      : "When instructors schedule tutoring sessions, they will appear here."}
                </p>
                {(dateFilter !== "all" || statusFilter !== "all" || searchQuery) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setDateFilter("all");
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

// Wrap with Suspense for useSearchParams (Next.js 16 requirement)
export default function AdminTutoringSessionsPage() {
  return (
    <Suspense
      fallback={
        <AdminDashboardLayout>
          <div className="px-4 py-6 sm:py-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-64 mb-8" />
            <Card>
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </AdminDashboardLayout>
      }
    >
      <AdminTutoringSessionsContent />
    </Suspense>
  );
}
