"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Clock, BookOpen, Mail, UserCheck, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    variant: "default",
    className: "bg-yellow-500 hover:bg-yellow-600",
  },
  assigned: {
    label: "Assigned",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    className: "",
  },
  enrolled: {
    label: "Enrolled",
    variant: "default",
    className: "bg-blue-500 hover:bg-blue-600",
  },
};

/**
 * AdminRequestCard - Admin view of a tutoring request with action buttons
 * @param {Object} request - The tutoring request object
 * @param {Function} onAssign - Callback when Assign button is clicked
 * @param {Function} onReject - Callback when Reject button is clicked
 */
export default function AdminRequestCard({ request, onAssign, onReject }) {
  const {
    _id,
    student,
    subject,
    status,
    preferredTimeSlots,
    message,
    assignedInstructor,
    assignedAt,
    rejectionReason,
    rejectedAt,
    createdAt,
  } = request;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isPending = status === "pending";
  const isAssigned = status === "assigned";
  const isRejected = status === "rejected";

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
    return `${student.firstname || ""} ${student.lastname || ""}`.trim() || "Unknown Student";
  };

  const getInstructorName = () => {
    if (!assignedInstructor) return "-";
    return `${assignedInstructor.firstname || ""} ${assignedInstructor.lastname || ""}`.trim() || "Unknown";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">
                {subject?.name || "Unknown Subject"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                NPR {subject?.monthlyPrice?.toLocaleString() || 0}/month
              </p>
            </div>
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

        {/* Request Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Requested: {formatDate(createdAt)}</span>
        </div>

        {/* Preferred Time Slots */}
        {preferredTimeSlots && preferredTimeSlots.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Preferred times:</span>
            </div>
            <div className="flex flex-wrap gap-1 ml-6">
              {preferredTimeSlots.map((slot, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {slot}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Student Message */}
        {message && (
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-sm text-muted-foreground italic line-clamp-3">
              &ldquo;{message}&rdquo;
            </p>
          </div>
        )}

        {/* Assignment Info (for assigned requests) */}
        {isAssigned && assignedInstructor && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="font-medium">{getInstructorName()}</span>
            </div>
            {assignedAt && (
              <p className="text-xs text-muted-foreground ml-6">
                on {formatDate(assignedAt)}
              </p>
            )}
          </div>
        )}

        {/* Rejection Info (for rejected requests) */}
        {isRejected && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-muted-foreground">Rejected</span>
              {rejectedAt && (
                <span className="text-xs text-muted-foreground">
                  on {formatDate(rejectedAt)}
                </span>
              )}
            </div>
            {rejectionReason && (
              <p className="text-sm text-muted-foreground ml-6 italic">
                Reason: {rejectionReason}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons (only for pending) */}
        {isPending && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onAssign?.(request)}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Assign
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => onReject?.(request)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
