"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";

/**
 * RequestStatusBadge - Displays a colored badge based on tutoring request status
 * @param {string} status - The request status: pending, assigned, rejected, enrolled
 */
export default function RequestStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      icon: Clock,
    },
    assigned: {
      label: "Assigned",
      variant: "secondary",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      icon: UserCheck,
    },
    rejected: {
      label: "Rejected",
      variant: "secondary",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
      icon: XCircle,
    },
    enrolled: {
      label: "Enrolled",
      variant: "secondary",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
      icon: CheckCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
