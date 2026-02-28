"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Clock,
  UserCheck,
  XCircle,
  GraduationCap,
  Search,
} from "lucide-react";
import { useAllTutoringRequests } from "@/lib/hooks/useTutoringRequest";
import AdminRequestCard from "@/components/tutoring/AdminRequestCard";
import AssignInstructorDialog from "@/components/tutoring/AssignInstructorDialog";
import RejectRequestDialog from "@/components/tutoring/RejectRequestDialog";

const STATUS_TABS = [
  { value: "all", label: "All", icon: ClipboardList },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "assigned", label: "Assigned", icon: UserCheck },
  { value: "rejected", label: "Rejected", icon: XCircle },
  { value: "enrolled", label: "Enrolled", icon: GraduationCap },
];

function AdminTutoringRequestsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  // Filter state
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync tab with URL params on mount
  useEffect(() => {
    const status = searchParams.get("status");
    if (status && STATUS_TABS.some(t => t.value === status)) {
      setActiveTab(status);
    }
  }, [searchParams]);

  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch all requests
  const { data, isLoading, isError, error, refetch } = useAllTutoringRequests();
  const allRequests = data?.data || [];

  // Filter requests by status and search query
  const filteredRequests = useMemo(() => {
    let filtered = allRequests;

    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter((request) => request.status === activeTab);
    }

    // Search filter (student name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((request) => {
        const studentName = request.student
          ? `${request.student.firstname || ""} ${request.student.lastname || ""}`.toLowerCase()
          : "";
        const studentEmail = request.student?.email?.toLowerCase() || "";
        const subjectName = request.subject?.name?.toLowerCase() || "";
        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          subjectName.includes(query)
        );
      });
    }

    return filtered;
  }, [allRequests, activeTab, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const counts = {
      all: allRequests.length,
      pending: 0,
      assigned: 0,
      rejected: 0,
      enrolled: 0,
    };
    allRequests.forEach((request) => {
      if (counts[request.status] !== undefined) {
        counts[request.status]++;
      }
    });
    return counts;
  }, [allRequests]);

  // Handle assign button click
  const handleAssignClick = (request) => {
    setSelectedRequest(request);
    setAssignDialogOpen(true);
  };

  // Handle reject button click
  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  // Close dialogs
  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedRequest(null);
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              Tutoring Requests
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Review and manage student tutoring requests
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {STATUS_TABS.map(({ value, label, icon: Icon }) => (
            <Card
              key={value}
              className={`cursor-pointer transition-all ${
                activeTab === value
                  ? "ring-2 ring-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setActiveTab(value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{stats[value]}</p>
                  </div>
                  <Icon
                    className={`h-8 w-8 ${
                      activeTab === value
                        ? "text-primary"
                        : "text-muted-foreground/50"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList className="flex flex-wrap">
              {STATUS_TABS.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-xs sm:text-sm"
                >
                  {label}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({stats[value]})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to load requests
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {error?.message || "An error occurred while fetching requests."}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Request Grid */}
          {!isLoading && !isError && filteredRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <AdminRequestCard
                  key={request._id}
                  request={request}
                  onAssign={handleAssignClick}
                  onReject={handleRejectClick}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? "No matching requests"
                  : activeTab === "all"
                    ? "No requests yet"
                    : `No ${activeTab} requests`}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search or filter criteria."
                  : activeTab === "all"
                    ? "When students submit tutoring requests, they will appear here for review."
                    : `There are currently no requests with "${activeTab}" status.`}
              </p>
              {(activeTab !== "all" || searchQuery) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setActiveTab("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Assign Instructor Dialog */}
        <AssignInstructorDialog
          open={assignDialogOpen}
          onOpenChange={handleCloseAssignDialog}
          request={selectedRequest}
          onSuccess={() => {}}
        />

        {/* Reject Request Dialog */}
        <RejectRequestDialog
          open={rejectDialogOpen}
          onOpenChange={handleCloseRejectDialog}
          request={selectedRequest}
          onSuccess={() => {}}
        />
      </div>
    </AdminDashboardLayout>
  );
}

// Wrap with Suspense for useSearchParams (Next.js 16 requirement)
export default function AdminTutoringRequestsPage() {
  return (
    <Suspense
      fallback={
        <AdminDashboardLayout>
          <div className="px-4 py-6 sm:py-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AdminDashboardLayout>
      }
    >
      <AdminTutoringRequestsContent />
    </Suspense>
  );
}
