"use client";

import { useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  RefreshCcw,
  Check,
  X,
  Clock,
  AlertCircle,
  Banknote,
  Eye,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// Mock data
const refundRequests = [
  {
    id: "REF001",
    user: { id: 1, name: "Aarav Sharma", email: "aarav@email.com" },
    course: { id: 1, title: "Complete Web Development Bootcamp", instructor: "Ramesh Kumar" },
    amount: 1999,
    originalPayment: "TXN001",
    reason: "Course content was not as described. Expected more advanced topics.",
    progress: 15,
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "pending",
  },
  {
    id: "REF002",
    user: { id: 2, name: "Priya Thapa", email: "priya@email.com" },
    course: { id: 2, title: "React.js Masterclass", instructor: "Sunita Adhikari" },
    amount: 1499,
    originalPayment: "TXN002",
    reason: "Found a better course elsewhere. Requesting refund within 7 days policy.",
    progress: 5,
    requestedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: "pending",
  },
  {
    id: "REF003",
    user: { id: 3, name: "Bikash Gurung", email: "bikash@email.com" },
    course: { id: 3, title: "Python for Data Science", instructor: "Ramesh Kumar" },
    amount: 2499,
    originalPayment: "TXN003",
    reason: "Technical issues prevented me from accessing the course videos.",
    progress: 0,
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "approved",
    processedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: "REF004",
    user: { id: 4, name: "Sita Rai", email: "sita@email.com" },
    course: { id: 1, title: "Complete Web Development Bootcamp", instructor: "Ramesh Kumar" },
    amount: 1999,
    originalPayment: "TXN004",
    reason: "Not satisfied with course quality.",
    progress: 45,
    requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    status: "rejected",
    processedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    rejectionReason: "Refund request exceeds our 7-day policy and course progress is over 30%.",
  },
];

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [refundToReject, setRefundToReject] = useState(null);

  const filteredRefunds = refundRequests.filter((refund) => {
    const matchesSearch =
      refund.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = refundRequests.filter((r) => r.status === "pending").length;
  const approvedCount = refundRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = refundRequests.filter((r) => r.status === "rejected").length;
  const totalRefunded = refundRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);

  const handleApprove = (refund) => {
    toast.success(`Refund of Rs. ${refund.amount.toLocaleString()} approved for ${refund.user.name}`);
    setSelectedRefund(null);
  };

  const openRejectDialog = (refund) => {
    setRefundToReject(refund);
    setIsRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    toast.success(`Refund rejected. ${refundToReject.user.name} will be notified.`);
    setIsRejectDialogOpen(false);
    setRejectionReason("");
    setRefundToReject(null);
    setSelectedRefund(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Refund Requests</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Review and process refund requests from students
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                Rs. {totalRefunded.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Refunded</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or refund ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Refund Requests List */}
        <div className="space-y-4">
          {filteredRefunds.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCcw className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No refund requests</h3>
                <p className="text-muted-foreground">
                  {statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No refund requests at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRefunds.map((refund) => (
              <Card key={refund.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {refund.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/admin-dashboard/users/${refund.user.id}`}
                              className="font-semibold hover:underline"
                            >
                              {refund.user.name}
                            </Link>
                            {getStatusBadge(refund.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {refund.user.email} • {refund.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            Rs. {refund.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested{" "}
                            {formatDistanceToNow(refund.requestedAt, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg mb-3">
                        <p className="text-sm font-medium mb-1">
                          Course: {refund.course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Instructor: {refund.course.instructor} • Progress:{" "}
                          {refund.progress}%
                        </p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Reason:</p>
                        <p className="text-sm text-muted-foreground">
                          {refund.reason}
                        </p>
                      </div>

                      {refund.status === "rejected" && refund.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                          <p className="text-sm font-medium text-red-800 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-600">
                            {refund.rejectionReason}
                          </p>
                        </div>
                      )}

                      {refund.status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(refund)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve Refund
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(refund)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRefund(refund)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      )}

                      {refund.status !== "pending" && refund.processedAt && (
                        <p className="text-xs text-muted-foreground">
                          Processed {format(refund.processedAt, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Refund Details Dialog */}
        <Dialog
          open={!!selectedRefund}
          onOpenChange={() => setSelectedRefund(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Refund Request Details</DialogTitle>
            </DialogHeader>
            {selectedRefund && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Request ID:</span>
                    <p className="font-medium">{selectedRefund.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Original Payment:</span>
                    <p className="font-medium">{selectedRefund.originalPayment}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Student:</span>
                    <p className="font-medium">{selectedRefund.user.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedRefund.user.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Course:</span>
                    <p className="font-medium">{selectedRefund.course.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress:</span>
                    <p className="font-medium">{selectedRefund.progress}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium text-primary">
                      Rs. {selectedRefund.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Requested:</span>
                    <p className="font-medium">
                      {format(selectedRefund.requestedAt, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Reason:</span>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {selectedRefund.reason}
                  </p>
                </div>

                {selectedRefund.progress > 30 && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800">High Progress Warning</p>
                      <p className="text-orange-600">
                        This student has completed {selectedRefund.progress}% of the
                        course. Consider if a full refund is appropriate.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedRefund)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Refund
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedRefund(null);
                      openRejectDialog(selectedRefund);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Refund Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {refundToReject && (
                <p className="text-sm">
                  Rejecting refund for:{" "}
                  <strong>{refundToReject.user.name}</strong> - Rs.{" "}
                  {refundToReject.amount.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejection. The student will be notified
                via email.
              </p>
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsRejectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                >
                  Reject Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
