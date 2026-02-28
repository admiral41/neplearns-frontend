"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  Lock,
} from "lucide-react";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";
import StatusTimeline from "./StatusTimeline";

/**
 * SubscriptionCard - Displays a subscription with status, dates, warnings, and timeline
 * @param {Object} subscription - The subscription object
 */
export default function SubscriptionCard({ subscription }) {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const {
    subject,
    instructor,
    status,
    trialStartedAt,
    trialEndsAt,
    currentPeriodEnd,
    isLastTrialDay,
    daysUntilExpiry,
    isLocked,
    isInGracePeriod,
    statusHistory,
    monthlyPrice,
  } = subscription;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Determine which date to show based on status
  const getDateInfo = () => {
    if (status === "trial") {
      return {
        label: "Trial ends",
        date: trialEndsAt,
      };
    }
    if (status === "active" || status === "expired_grace") {
      return {
        label: status === "expired_grace" ? "Expired on" : "Renews on",
        date: currentPeriodEnd,
      };
    }
    if (status === "expired" || status === "cancelled") {
      return {
        label: "Ended on",
        date: currentPeriodEnd || trialEndsAt,
      };
    }
    return null;
  };

  const dateInfo = getDateInfo();

  // Check if 7-day expiry warning should show
  const showExpiryWarning =
    status === "active" &&
    daysUntilExpiry !== null &&
    daysUntilExpiry > 0 &&
    daysUntilExpiry <= 7;

  // Check if payment nudge should show (last day of trial)
  const showPaymentNudge = status === "trial" && isLastTrialDay;

  // Check if grace period warning should show
  const showGracePeriodWarning = isInGracePeriod;

  return (
    <Card className={`h-full relative ${isLocked ? "opacity-75" : ""}`}>
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-900/10 rounded-lg z-10 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <Lock className="h-8 w-8 mx-auto text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Subscription {status === "cancelled" ? "Cancelled" : "Expired"}
            </p>
            <Button size="sm" className="mt-2">
              <CreditCard className="h-4 w-4 mr-2" />
              Reactivate
            </Button>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg truncate">{subject?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              NPR {monthlyPrice?.toLocaleString()}/month
            </p>
          </div>
          <SubscriptionStatusBadge status={status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Warning banners */}
        {showPaymentNudge && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Trial ends today!
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Submit payment to continue your tutoring sessions without
                  interruption.
                </p>
                <Button size="sm" className="mt-2" variant="default">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Submit Payment
                </Button>
              </div>
            </div>
          </div>
        )}

        {showExpiryWarning && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Subscription expires in {daysUntilExpiry} day
                  {daysUntilExpiry > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Renew now to keep your tutoring sessions active.
                </p>
              </div>
            </div>
          </div>
        )}

        {showGracePeriodWarning && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Grace period active
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Your subscription has expired but you still have limited access.
                  Pay now to avoid losing access completely.
                </p>
                <Button size="sm" className="mt-2" variant="default">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Trial start date */}
        {status === "trial" && trialStartedAt && (
          <p className="text-sm text-muted-foreground">
            Trial started {formatDate(trialStartedAt)}
          </p>
        )}

        {/* Primary date info */}
        {dateInfo && (
          <p className="text-sm text-muted-foreground">
            {dateInfo.label} {formatDate(dateInfo.date)}
          </p>
        )}

        {/* Instructor info */}
        {instructor && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Your Instructor</p>
                <p className="text-sm font-medium text-blue-800">
                  {instructor.firstname} {instructor.lastname}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Status Timeline */}
        {statusHistory && statusHistory.length > 0 && (
          <Collapsible open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-sm">Status History</span>
                {isTimelineOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="border rounded-lg p-3 bg-muted/30">
                <StatusTimeline statusHistory={statusHistory} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* View Details Link */}
        <div className="pt-2 border-t">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/student-dashboard/tutoring/my-subscriptions/${subscription._id}`}>
              View Details
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
