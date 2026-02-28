"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import RequestStatusBadge from "./RequestStatusBadge";

/**
 * RequestCard - Displays a tutoring request with status, subject info, and details
 * @param {Object} request - The tutoring request object
 * @param {Object} request.subject - Subject details (name, monthlyPrice)
 * @param {string} request.status - Request status (pending, assigned, rejected, enrolled)
 * @param {Array} request.preferredTimeSlots - Array of preferred time slots
 * @param {string} request.message - Optional message from student
 * @param {Object} request.assignedInstructor - Instructor info when assigned
 * @param {string} request.rejectionReason - Reason when rejected
 * @param {Date} request.createdAt - Request creation date
 */
export default function RequestCard({ request }) {
  const {
    subject,
    status,
    preferredTimeSlots,
    message,
    assignedInstructor,
    rejectionReason,
    createdAt,
  } = request;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg truncate">{subject?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              NPR {subject?.monthlyPrice?.toLocaleString()}/month
            </p>
          </div>
          <RequestStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submitted date */}
        <p className="text-sm text-muted-foreground">
          Submitted {formatDate(createdAt)}
        </p>

        {/* Preferred time slots */}
        {preferredTimeSlots && preferredTimeSlots.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Preferred Times</p>
            <div className="flex flex-wrap gap-1">
              {preferredTimeSlots.map((slot, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {slot}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">{message}</p>
          </div>
        )}

        {/* Assigned instructor (when status is assigned or enrolled) */}
        {(status === "assigned" || status === "enrolled") && assignedInstructor && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Assigned Instructor</p>
                <p className="text-sm font-medium text-blue-800">
                  {assignedInstructor.firstname} {assignedInstructor.lastname}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection reason (when status is rejected) */}
        {status === "rejected" && rejectionReason && (
          <div className="pt-2 border-t">
            <div className="p-2 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-800">{rejectionReason}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
