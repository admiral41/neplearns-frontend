"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, UserCheck } from "lucide-react";
import { useInstructors } from "@/lib/hooks/useUsers";
import { useAssignInstructor } from "@/lib/hooks/useTutoringRequest";

/**
 * AssignInstructorDialog - Dialog for selecting and assigning an instructor to a request
 * @param {boolean} open - Whether dialog is open
 * @param {Function} onOpenChange - Callback when dialog open state changes
 * @param {Object} request - The tutoring request being assigned
 * @param {Function} onSuccess - Callback after successful assignment
 */
export default function AssignInstructorDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}) {
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [platformFee, setPlatformFee] = useState("");

  // Fetch available instructors
  const { data: instructorsData, isLoading, isError, error } = useInstructors();
  const instructors = instructorsData?.data?.users || [];

  // Assignment mutation
  const assignMutation = useAssignInstructor();

  // Set default platform fee from subject when request changes
  useEffect(() => {
    if (request?.subject?.platformFeePercentage !== undefined) {
      setPlatformFee(request.subject.platformFeePercentage.toString());
    } else {
      setPlatformFee("15"); // Default to 15%
    }
  }, [request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstructorId || !request?._id) return;

    assignMutation.mutate(
      {
        requestId: request._id,
        instructorId: selectedInstructorId,
        platformFeePercentage: parseFloat(platformFee) || 15
      },
      {
        onSuccess: () => {
          setSelectedInstructorId("");
          setPlatformFee("");
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedInstructorId("");
    setPlatformFee("");
    onOpenChange(false);
  };

  const getStudentName = () => {
    if (!request?.student) return "Unknown Student";
    return `${request.student.firstname || ""} ${request.student.lastname || ""}`.trim() || "Unknown Student";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Instructor</DialogTitle>
          <DialogDescription>
            Assign an instructor to {getStudentName()}&apos;s request for{" "}
            <span className="font-medium">{request?.subject?.name || "this subject"}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error?.message || "Failed to load instructors"}</span>
              </div>
            )}

            {/* Instructor Select */}
            {!isLoading && !isError && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Select Instructor *</Label>
                  {instructors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No active instructors available.
                    </p>
                  ) : (
                    <Select
                      value={selectedInstructorId}
                      onValueChange={setSelectedInstructorId}
                    >
                      <SelectTrigger id="instructor">
                        <SelectValue placeholder="Choose an instructor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor._id} value={instructor._id}>
                            {instructor.firstname} {instructor.lastname}
                            {instructor.email && (
                              <span className="text-muted-foreground ml-2">
                                ({instructor.email})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Platform Fee Input */}
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee (%)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    placeholder="15"
                  />
                  <p className="text-xs text-muted-foreground">
                    Subject default: {request?.subject?.platformFeePercentage ?? 15}%
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedInstructorId ||
                assignMutation.isPending ||
                isLoading ||
                instructors.length === 0
              }
            >
              {assignMutation.isPending ? (
                "Assigning..."
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  Assign Instructor
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
