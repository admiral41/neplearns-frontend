"use client";

import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  AlertCircle,
  Timer,
} from "lucide-react";

/**
 * SubscriptionStatusBadge - Displays a color-coded badge based on subscription status
 * @param {string} status - The subscription status: trial, pending, active, expired, expired_grace, paused, cancelled
 */
export default function SubscriptionStatusBadge({ status }) {
  const statusConfig = {
    trial: {
      label: "Trial",
      variant: "secondary",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      icon: Timer,
    },
    pending: {
      label: "Pending",
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      icon: Clock,
    },
    active: {
      label: "Active",
      variant: "secondary",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
      icon: CheckCircle,
    },
    expired: {
      label: "Expired",
      variant: "secondary",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
      icon: XCircle,
    },
    expired_grace: {
      label: "Grace Period",
      variant: "secondary",
      className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      icon: AlertCircle,
    },
    paused: {
      label: "Paused",
      variant: "secondary",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      icon: PauseCircle,
    },
    cancelled: {
      label: "Cancelled",
      variant: "secondary",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
      icon: XCircle,
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
