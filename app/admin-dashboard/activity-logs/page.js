"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Search,
  Download,
  User,
  LogIn,
  LogOut,
  BookOpen,
  CreditCard,
  Settings,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Filter,
  Video,
  Bell,
  FolderOpen,
  RefreshCw,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { activityLogAPI, ACTION_LABELS, CATEGORY_LABELS } from "@/lib/api/activityLogs";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "AUTH", label: "Authentication" },
  { value: "COURSE", label: "Courses" },
  { value: "LESSON", label: "Lessons" },
  { value: "LECTURER", label: "Lecturers" },
  { value: "ADMIN", label: "Admin Actions" },
  { value: "CATEGORY", label: "Categories" },
  { value: "LIVE_CLASS", label: "Live Classes" },
  { value: "ANNOUNCEMENT", label: "Announcements" },
  { value: "QUIZ", label: "Quizzes" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "PENDING", label: "Pending" },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7days");

  // Fetch activity logs
  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true);

      // Calculate date range
      let startDate;
      const endDate = new Date();
      switch (dateFilter) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate = null;
      }

      const params = {
        page,
        limit: pagination.limit,
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
      };

      const response = await activityLogAPI.getActivityLogs(params);
      setLogs(response.data || []);
      setPagination({
        page,
        limit: pagination.limit,
        total: response.totalData || 0,
        pages: response.totalPage || 0,
      });
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to fetch activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await activityLogAPI.getActivityStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, [categoryFilter, statusFilter, dateFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchLogs(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await activityLogAPI.exportActivityLogs({
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Activity logs exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export activity logs");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchLogs(newPage);
  };

  const getActivityIcon = (action, category) => {
    // Auth icons
    if (action === "USER_LOGIN") return <LogIn className="h-4 w-4 text-green-500" />;
    if (action === "USER_LOGOUT") return <LogOut className="h-4 w-4 text-gray-500" />;
    if (action === "USER_REGISTER") return <UserPlus className="h-4 w-4 text-blue-500" />;
    if (action === "EMAIL_VERIFIED") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (action === "PASSWORD_RESET") return <Settings className="h-4 w-4 text-orange-500" />;

    // Course icons
    if (category === "COURSE") {
      if (action.includes("CREATED")) return <BookOpen className="h-4 w-4 text-purple-500" />;
      if (action.includes("DELETED")) return <Trash2 className="h-4 w-4 text-red-500" />;
      if (action.includes("PUBLISHED")) return <CheckCircle className="h-4 w-4 text-green-500" />;
      if (action.includes("ENROLLED")) return <BookOpen className="h-4 w-4 text-blue-500" />;
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    }

    // Lecturer icons
    if (category === "LECTURER") {
      if (action.includes("APPROVED")) return <CheckCircle className="h-4 w-4 text-green-500" />;
      if (action.includes("REJECTED")) return <XCircle className="h-4 w-4 text-red-500" />;
      return <User className="h-4 w-4 text-orange-500" />;
    }

    // Admin icons
    if (category === "ADMIN") return <Shield className="h-4 w-4 text-primary" />;

    // Live class icons
    if (category === "LIVE_CLASS") return <Video className="h-4 w-4 text-pink-500" />;

    // Announcement icons
    if (category === "ANNOUNCEMENT") return <Bell className="h-4 w-4 text-yellow-500" />;

    // Category icons
    if (category === "CATEGORY") return <FolderOpen className="h-4 w-4 text-cyan-500" />;

    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
      case "SUPERADMIN":
        return <Badge className="bg-primary text-xs">Admin</Badge>;
      case "LECTURER":
        return (
          <Badge variant="outline" className="text-xs border-purple-500 text-purple-500">
            Instructor
          </Badge>
        );
      case "STUDENT":
        return (
          <Badge variant="outline" className="text-xs">
            Student
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs text-gray-500">
            Guest
          </Badge>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-500 text-xs">Success</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500 text-xs">Failed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500 text-xs">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Activity Logs</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor all platform activities and events
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => { fetchLogs(pagination.page); fetchStats(); }}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              {stats ? (
                <>
                  <p className="text-2xl font-bold">{stats.total?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              {stats ? (
                <>
                  <p className="text-2xl font-bold">{stats.successCount?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              {stats ? (
                <>
                  <p className="text-2xl font-bold">{stats.failedCount?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogIn className="h-5 w-5 text-blue-500" />
              </div>
              {stats?.categoryStats ? (
                <>
                  <p className="text-2xl font-bold">
                    {stats.categoryStats.find(c => c._id === 'AUTH')?.count?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Auth Events</p>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Feed</CardTitle>
              {pagination.total > 0 && (
                <span className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activities found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={log._id}
                    className={`flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors ${
                      index !== logs.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="mt-1 p-2 rounded-full bg-muted shrink-0">
                      {getActivityIcon(log.action, log.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <span className="font-medium">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        {getRoleBadge(log.userRole)}
                        {log.status !== "SUCCESS" && getStatusBadge(log.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {log.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {log.userName || log.userEmail ? (
                          <Link
                            href={log.user?._id ? `/admin-dashboard/users/${log.user._id}` : "#"}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <User className="h-3 w-3" />
                            {log.userName || log.userEmail || "Unknown"}
                          </Link>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Guest
                          </span>
                        )}
                        {log.targetName && (
                          <span className="flex items-center gap-1">
                            • Target: {log.targetName}
                          </span>
                        )}
                        {log.ipAddress && (
                          <span className="flex items-center gap-1">
                            • IP: {log.ipAddress}
                          </span>
                        )}
                        <span>
                          • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs text-muted-foreground shrink-0 hidden sm:block">
                      <div>{format(new Date(log.createdAt), "MMM d, yyyy")}</div>
                      <div>{format(new Date(log.createdAt), "h:mm a")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
