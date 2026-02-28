"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";
import { useCreateTutoringRequest } from "@/lib/hooks/useTutoringRequest";

// Predefined time slot options
const TIME_SLOTS = [
  "Morning (6 AM - 10 AM)",
  "Late Morning (10 AM - 12 PM)",
  "Afternoon (12 PM - 4 PM)",
  "Evening (4 PM - 7 PM)",
  "Night (7 PM - 10 PM)",
  "Weekdays only",
  "Weekends only",
  "Flexible",
];

/**
 * RequestForm - Modal dialog for submitting a tutoring request
 * @param {boolean} open - Whether the dialog is open
 * @param {Function} onOpenChange - Callback to toggle dialog
 * @param {Object} subject - The selected tutoring subject
 */
export default function RequestForm({ open, onOpenChange, subject }) {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [message, setMessage] = useState("");

  const createRequest = useCreateTutoringRequest();

  const handleTimeSlotToggle = (slot) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject?._id) return;

    createRequest.mutate(
      {
        subjectId: subject._id,
        preferredTimeSlots: selectedTimeSlots,
        message: message.trim(),
      },
      {
        onSuccess: () => {
          // Reset form and close dialog
          setSelectedTimeSlots([]);
          setMessage("");
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = () => {
    if (!createRequest.isPending) {
      setSelectedTimeSlots([]);
      setMessage("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Request Tutoring
          </DialogTitle>
          <DialogDescription>
            Submit a request for private tutoring. An admin will review and assign an
            instructor to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Subject info */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">{subject?.name}</p>
            <p className="text-sm text-muted-foreground">
              NPR {subject?.monthlyPrice?.toLocaleString()}/month after trial
            </p>
          </div>

          {/* Preferred time slots */}
          <div className="mb-4">
            <Label className="mb-2 block">Preferred Time Slots (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => (
                <label
                  key={slot}
                  className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedTimeSlots.includes(slot)}
                    onCheckedChange={() => handleTimeSlotToggle(slot)}
                  />
                  {slot}
                </label>
              ))}
            </div>
            {selectedTimeSlots.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedTimeSlots.map((slot) => (
                  <Badge key={slot} variant="secondary" className="text-xs">
                    {slot}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mb-4">
            <Label htmlFor="message" className="mb-2 block">
              Additional Message (optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any specific requirements, topics you need help with, or questions..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{message.length}/500 characters</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createRequest.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRequest.isPending}>
              {createRequest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
