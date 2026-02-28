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
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  Search,
} from "lucide-react";
import {
  useAllSubscriptions,
  useActivateSubscription,
  usePauseSubscription,
  useCancelSubscription,
  useExtendSubscription,
} from "@/lib/hooks/useTutoringEnrollment";
import AdminSubscriptionCard from "@/components/tutoring/AdminSubscriptionCard";
import SubscriptionActionDialog from "@/components/tutoring/SubscriptionActionDialog";
import ExtendSubscriptionDialog from "@/components/tutoring/ExtendSubscriptionDialog";

// Status tabs configuration - display-only stats cards, NOT clickable per CONTEXT.md
const STATUS_TABS = [
  { value: "all", label: "All", icon: CreditCard },
  { value: "trial", label: "Trial", icon: Clock },
  { value: "active", label: "Active", icon: CheckCircle },
  { value: "pending", label: "Pending", icon: PlayCircle },
  { value: "expired", label: "Expired", icon: XCircle },
  { value: "paused", label: "Paused", icon: PauseCircle },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

// Stats cards config (subset for top display)
const STATS_CONFIG = [
  { value: "all", label: "Total", icon: CreditCard, color: "text-primary" },
  { value: "trial", label: "Trial", icon: Clock, color: "text-blue-600" },
  { value: "active", label: "Active", icon: CheckCircle, color: "text-green-600" },
  { value: "pending", label: "Pending", icon: PlayCircle, color: "text-yellow-600" },
  { value: "expired", label: "Expired", icon: XCircle, color: "text-red-600" },
];

function AdminTutoringSubscriptionsContent() {
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
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [currentAction, setCurrentAction] = useState(null); // "activate" | "pause" | "cancel"

  // Fetch all subscriptions
  const { data, isLoading, isError, error, refetch } = useAllSubscriptions();
  const allSubscriptions = data?.data || [];

  // Mutations
  const activateMutation = useActivateSubscription();
  const pauseMutation = usePauseSubscription();
  const cancelMutation = useCancelSubscription();
  const extendMutation = useExtendSubscription();

  // Filter subscriptions by status and search query
  const filteredSubscriptions = useMemo(() => {
    let filtered = allSubscriptions;

    // Status filter
    if (activeTab !== "all") {
      // Handle expired_grace as part of expired filter
      if (activeTab === "expired") {
        filtered = filtered.filter(
          (sub) => sub.status === "expired" || sub.status === "expired_grace"
        );
      } else {
        filtered = filtered.filter((sub) => sub.status === activeTab);
      }
    }

    // Search filter (student or instructor name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sub) => {
        const studentName = sub.student
          ? `${sub.student.firstname || ""} ${sub.student.lastname || ""}`.toLowerCase()
          : "";
        const studentEmail = sub.student?.email?.toLowerCase() || "";
        const instructorName = sub.instructor
          ? `${sub.instructor.firstname || ""} ${sub.instructor.lastname || ""}`.toLowerCase()
          : "";
        const subjectName = sub.subject?.name?.toLowerCase() || "";
        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          instructorName.includes(query) ||
          subjectName.includes(query)
        );
      });
    }

    return filtered;
  }, [allSubscriptions, activeTab, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const counts = {
      all: allSubscriptions.length,
      trial: 0,
      active: 0,
      pending: 0,
      expired: 0,
      paused: 0,
      cancelled: 0,
    };
    allSubscriptions.forEach((sub) => {
      const status = sub.status;
      // Group expired_grace with expired
      if (status === "expired_grace") {
        counts.expired++;
      } else if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [allSubscriptions]);

  // Handle action button clicks
  const handleActivateClick = (subscription) => {
    setSelectedSubscription(subscription);
    setCurrentAction("activate");
    setActionDialogOpen(true);
  };

  const handlePauseClick = (subscription) => {
    setSelectedSubscription(subscription);
    setCurrentAction("pause");
    setActionDialogOpen(true);
  };

  const handleCancelClick = (subscription) => {
    setSelectedSubscription(subscription);
    setCurrentAction("cancel");
    setActionDialogOpen(true);
  };

  const handleExtendClick = (subscription) => {
    setSelectedSubscription(subscription);
    setExtendDialogOpen(true);
  };

  // Handle action confirmation
  const handleActionConfirm = (id) => {
    if (currentAction === "activate") {
      activateMutation.mutate(id, {
        onSuccess: () => {
          setActionDialogOpen(false);
          setSelectedSubscription(null);
          setCurrentAction(null);
        },
      });
    } else if (currentAction === "pause") {
      pauseMutation.mutate(id, {
        onSuccess: () => {
          setActionDialogOpen(false);
          setSelectedSubscription(null);
          setCurrentAction(null);
        },
      });
    } else if (currentAction === "cancel") {
      cancelMutation.mutate(id, {
        onSuccess: () => {
          setActionDialogOpen(false);
          setSelectedSubscription(null);
          setCurrentAction(null);
        },
      });
    }
  };

  // Handle extend confirmation
  const handleExtendConfirm = ({ id, days }) => {
    extendMutation.mutate(
      { id, days },
      {
        onSuccess: () => {
          setExtendDialogOpen(false);
          setSelectedSubscription(null);
        },
      }
    );
  };

  // Close dialogs
  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedSubscription(null);
    setCurrentAction(null);
  };

  const handleCloseExtendDialog = () => {
    setExtendDialogOpen(false);
    setSelectedSubscription(null);
  };

  // Get pending state for current action
  const isActionPending =
    (currentAction === "activate" && activateMutation.isPending) ||
    (currentAction === "pause" && pauseMutation.isPending) ||
    (currentAction === "cancel" && cancelMutation.isPending);

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">
              Tutoring Subscriptions
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage student tutoring subscriptions and billing
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards - Display only, NOT clickable per CONTEXT.md */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {STATS_CONFIG.map(({ value, label, icon: Icon, color }) => (
            <Card key={value}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{stats[value]}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${color} opacity-50`} />
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
              placeholder="Search by student, instructor, or subject..."
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
                Failed to load subscriptions
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {error?.message || "An error occurred while fetching subscriptions."}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Subscription Grid */}
          {!isLoading && !isError && filteredSubscriptions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubscriptions.map((subscription) => (
                <AdminSubscriptionCard
                  key={subscription._id}
                  subscription={subscription}
                  onActivate={handleActivateClick}
                  onPause={handlePauseClick}
                  onCancel={handleCancelClick}
                  onExtend={handleExtendClick}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredSubscriptions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? "No matching subscriptions"
                  : activeTab === "all"
                    ? "No subscriptions yet"
                    : `No ${activeTab} subscriptions`}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search or filter criteria."
                  : activeTab === "all"
                    ? "When students get assigned tutors and start their trials, their subscriptions will appear here."
                    : `There are currently no subscriptions with "${activeTab}" status.`}
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

        {/* Action Dialog (Activate/Pause/Cancel) */}
        <SubscriptionActionDialog
          open={actionDialogOpen}
          onOpenChange={handleCloseActionDialog}
          subscription={selectedSubscription}
          action={currentAction}
          onConfirm={handleActionConfirm}
          isPending={isActionPending}
        />

        {/* Extend Dialog */}
        <ExtendSubscriptionDialog
          open={extendDialogOpen}
          onOpenChange={handleCloseExtendDialog}
          subscription={selectedSubscription}
          onConfirm={handleExtendConfirm}
          isPending={extendMutation.isPending}
        />
      </div>
    </AdminDashboardLayout>
  );
}

// Wrap with Suspense for useSearchParams (Next.js 16 requirement)
export default function AdminTutoringSubscriptionsPage() {
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
      <AdminTutoringSubscriptionsContent />
    </Suspense>
  );
}
