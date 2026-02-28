"use client";

import { CheckCircle, Clock } from "lucide-react";

/**
 * StatusTimeline - Displays the status history of a subscription
 * @param {Array} statusHistory - Array of status history entries
 * @param {string} statusHistory[].status - The status at this point
 * @param {Date} statusHistory[].changedAt - When the status changed
 * @param {Object} statusHistory[].changedBy - User who made the change
 * @param {string} statusHistory[].note - Optional note about the change
 */
export default function StatusTimeline({ statusHistory = [] }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      trial: "Trial Started",
      pending: "Payment Pending",
      active: "Subscription Active",
      expired: "Subscription Expired",
      expired_grace: "Grace Period",
      paused: "Subscription Paused",
      cancelled: "Subscription Cancelled",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      trial: "text-blue-600 bg-blue-100",
      pending: "text-yellow-600 bg-yellow-100",
      active: "text-green-600 bg-green-100",
      expired: "text-red-600 bg-red-100",
      expired_grace: "text-orange-600 bg-orange-100",
      paused: "text-gray-600 bg-gray-100",
      cancelled: "text-red-600 bg-red-100",
    };
    return colors[status] || "text-gray-600 bg-gray-100";
  };

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No status history available.
      </div>
    );
  }

  // Sort by date descending (most recent first)
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.changedAt) - new Date(a.changedAt)
  );

  return (
    <div className="space-y-3">
      {sortedHistory.map((entry, index) => (
        <div key={index} className="flex gap-3">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(
                entry.status
              )}`}
            >
              {index === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            {index < sortedHistory.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-[20px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">{getStatusLabel(entry.status)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(entry.changedAt)}
            </p>
            {entry.changedBy && (
              <p className="text-xs text-muted-foreground">
                by {entry.changedBy.firstname} {entry.changedBy.lastname}
              </p>
            )}
            {entry.note && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {entry.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
