"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  Mail,
  UserCheck,
  PlayCircle,
  PauseCircle,
  XCircle,
  Clock,
  CalendarPlus,
  CreditCard,
} from "lucide-react";

// Status configuration for different subscription states
const STATUS_CONFIG = {
  trial: {
    label: "Trial",
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  pending: {
    label: "Pending",
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  active: {
    label: "Active",
    variant: "secondary",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  expired: {
    label: "Expired",
    variant: "secondary",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  expired_grace: {
    label: "Grace Period",
    variant: "secondary",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  paused: {
    label: "Paused",
    variant: "secondary",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    className: "",
  },
};

/**
 * AdminSubscriptionCard - Admin view of a tutoring subscription with action buttons
 * @param {Object} subscription - The tutoring enrollment/subscription object
 * @param {Function} onActivate - Callback when Activate button is clicked
 * @param {Function} onPause - Callback when Pause button is clicked
 * @param {Function} onCancel - Callback when Cancel button is clicked
 * @param {Function} onExtend - Callback when Extend button is clicked
 */
export default function AdminSubscriptionCard({
  subscription,
  onActivate,
  onPause,
  onCancel,
  onExtend,
}) {
  const {
    _id,
    student,
    subject,
    instructor,
    status,
    paymentStatus,
    trialStartedAt,
    trialEndsAt,
    currentPeriodStart,
    currentPeriodEnd,
    monthlyPrice,
    createdAt,
  } = subscription;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  // Status flags for conditional rendering
  const isTrial = status === "trial";
  const isPending = status === "pending";
  const isActive = status === "active";
  const isExpired = status === "expired" || status === "expired_grace";
  const isPaused = status === "paused";
  const isCancelled = status === "cancelled";

  // Can activate only if expired or paused (trial → pay first, pending → verify payment first)
  const canActivate = isExpired || isPaused;
  // Can pause if active
  const canPause = isActive;
  // Can cancel if not trial, active, paused, expired, or pending
  const canCancel = !isCancelled && !isTrial;
  // Can extend if not cancelled
  const canExtend = !isCancelled;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStudentName = () => {
    if (!student) return "Unknown Student";
    return (
      `${student.firstname || ""} ${student.lastname || ""}`.trim() ||
      "Unknown Student"
    );
  };

  const getInstructorName = () => {
    if (!instructor) return "-";
    return (
      `${instructor.firstname || ""} ${instructor.lastname || ""}`.trim() ||
      "Unknown"
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <CardTitle className="text-lg truncate">
              {subject?.name || "Unknown Subject"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              NPR {monthlyPrice?.toLocaleString() || subject?.monthlyPrice?.toLocaleString() || 0}/month
            </p>
          </div>
          <Badge
            variant={statusConfig.variant}
            className={statusConfig.className}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Student Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{getStudentName()}</span>
          </div>
          {student?.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>
          )}
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-2 text-sm">
          <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Instructor:</span>
          <span className="font-medium">{getInstructorName()}</span>
        </div>

        {/* Trial Period */}
        {isTrial && trialEndsAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Trial ends: {formatDate(trialEndsAt)}</span>
          </div>
        )}

        {/* Subscription Period */}
        {(isActive || isPaused) && currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {isActive ? "Renews" : "Period ends"}: {formatDate(currentPeriodEnd)}
            </span>
          </div>
        )}

        {/* Expired Period */}
        {isExpired && currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Expired: {formatDate(currentPeriodEnd)}</span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Started: {formatDate(trialStartedAt || createdAt)}</span>
        </div>

        {/* Payment Pending Notice */}
        {paymentStatus === "pending_verification" && (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full text-yellow-700 border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
          >
            <Link href="/admin-dashboard/tutoring-payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Review Payment
            </Link>
          </Button>
        )}

        {/* Action Buttons */}
        {!isCancelled && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            {canActivate && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onActivate?.(subscription)}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Activate
              </Button>
            )}
            {canPause && (
              <Button
                size="sm"
                variant="outline"
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                onClick={() => onPause?.(subscription)}
              >
                <PauseCircle className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            {canExtend && (
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onExtend?.(subscription)}
              >
                <CalendarPlus className="h-4 w-4 mr-1" />
                Extend
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onCancel?.(subscription)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* Cancelled State */}
        {isCancelled && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground text-center">
              This subscription has been cancelled.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
