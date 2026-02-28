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
  Wallet,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";

// Mock data
const pendingPayouts = [
  {
    id: 1,
    instructor: { id: 1, name: "Ramesh Kumar", email: "ramesh@email.com" },
    balance: 45000,
    pendingAmount: 12500,
    lastPayout: new Date("2024-02-15"),
    bankDetails: {
      bankName: "NIC Asia Bank",
      accountNumber: "****4567",
      accountHolder: "Ramesh Kumar",
    },
    courses: 5,
    students: 156,
  },
  {
    id: 2,
    instructor: { id: 2, name: "Sunita Adhikari", email: "sunita@email.com" },
    balance: 28000,
    pendingAmount: 8500,
    lastPayout: new Date("2024-02-20"),
    bankDetails: {
      bankName: "Nabil Bank",
      accountNumber: "****7890",
      accountHolder: "Sunita Adhikari",
    },
    courses: 3,
    students: 89,
  },
  {
    id: 3,
    instructor: { id: 3, name: "Prakash Shrestha", email: "prakash@email.com" },
    balance: 15000,
    pendingAmount: 5200,
    lastPayout: null,
    bankDetails: {
      bankName: "Global IME Bank",
      accountNumber: "****1234",
      accountHolder: "Prakash Shrestha",
    },
    courses: 2,
    students: 45,
  },
];

const payoutHistory = [
  {
    id: "PAY001",
    instructor: { id: 1, name: "Ramesh Kumar" },
    amount: 25000,
    method: "Bank Transfer",
    status: "completed",
    processedAt: new Date("2024-02-15"),
    reference: "TRF-2024-001",
  },
  {
    id: "PAY002",
    instructor: { id: 2, name: "Sunita Adhikari" },
    amount: 18000,
    method: "Bank Transfer",
    status: "completed",
    processedAt: new Date("2024-02-20"),
    reference: "TRF-2024-002",
  },
  {
    id: "PAY003",
    instructor: { id: 1, name: "Ramesh Kumar" },
    amount: 15000,
    method: "Bank Transfer",
    status: "processing",
    processedAt: new Date("2024-03-10"),
    reference: "TRF-2024-003",
  },
  {
    id: "PAY004",
    instructor: { id: 3, name: "Prakash Shrestha" },
    amount: 8000,
    method: "Bank Transfer",
    status: "failed",
    processedAt: new Date("2024-03-08"),
    reference: "TRF-2024-004",
    failureReason: "Invalid bank account details",
  },
];

export default function PayoutsPage() {
  const { showAlert } = useAlertDialog();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  const filteredPending = pendingPayouts.filter((payout) =>
    payout.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payout.instructor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = payoutHistory.filter((payout) => {
    const matchesSearch =
      payout.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.pendingAmount, 0);
  const totalProcessed = payoutHistory
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const openPayoutDialog = (instructor) => {
    setSelectedInstructor(instructor);
    setPayoutAmount(instructor.pendingAmount.toString());
    setIsPayoutDialogOpen(true);
  };

  const handleProcessPayout = () => {
    if (!payoutAmount || parseInt(payoutAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (parseInt(payoutAmount) > selectedInstructor.pendingAmount) {
      toast.error("Amount cannot exceed pending balance.");
      return;
    }
    toast.success(`Payout of Rs. ${parseInt(payoutAmount).toLocaleString()} initiated for ${selectedInstructor.instructor.name}`);
    setIsPayoutDialogOpen(false);
    setSelectedInstructor(null);
    setPayoutAmount("");
    setPayoutNote("");
  };

  const handleRetryPayout = (payoutId) => {
    toast.success("Payout retry initiated.");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
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
            <h1 className="text-lg sm:text-xl font-bold mb-1">Instructor Payouts</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage instructor earnings and process payouts
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">
                Rs. {(totalPending / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">Total Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">
                Rs. {(totalProcessed / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">Total Paid Out</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">
                {payoutHistory.filter((p) => p.status === "processing").length}
              </p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold">
                {payoutHistory.filter((p) => p.status === "failed").length}
              </p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
          >
            Pending Payouts ({pendingPayouts.length})
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
          >
            Payout History
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by instructor name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === "history" && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {filteredPending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending payouts</h3>
                  <p className="text-muted-foreground">
                    All instructors have been paid
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPending.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <Avatar className="h-14 w-14 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {payout.instructor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <div>
                            <Link
                              href={`/admin-dashboard/users/${payout.instructor.id}`}
                              className="text-lg font-semibold hover:underline"
                            >
                              {payout.instructor.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {payout.instructor.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              Rs. {payout.pendingAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Pending payout
                            </p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-4 gap-3 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">
                              Total Balance:
                            </span>
                            <p className="font-medium">
                              Rs. {payout.balance.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Courses:</span>
                            <p className="font-medium">{payout.courses}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Students:</span>
                            <p className="font-medium">{payout.students}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Payout:</span>
                            <p className="font-medium">
                              {payout.lastPayout
                                ? format(payout.lastPayout, "MMM d, yyyy")
                                : "Never"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Bank: </span>
                            <span className="font-medium">
                              {payout.bankDetails.bankName} -{" "}
                              {payout.bankDetails.accountNumber}
                            </span>
                          </div>
                          <Button
                            onClick={() => openPayoutDialog(payout)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Process Payout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Payout History */}
        {activeTab === "history" && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payout.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {payout.reference}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin-dashboard/users/${payout.instructor.id}`}
                          className="hover:underline"
                        >
                          {payout.instructor.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        Rs. {payout.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getStatusBadge(payout.status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(payout.processedAt, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {payout.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryPayout(payout.id)}
                          >
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredHistory.length === 0 && (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payout history</h3>
                  <p className="text-muted-foreground">
                    No payouts have been processed yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Process Payout Dialog */}
        <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payout</DialogTitle>
            </DialogHeader>
            {selectedInstructor && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedInstructor.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedInstructor.instructor.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available: Rs.{" "}
                      {selectedInstructor.pendingAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Payout Amount (Rs.)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={selectedInstructor.pendingAmount}
                  />
                </div>

                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-1">Bank Details</p>
                  <p className="text-muted-foreground">
                    {selectedInstructor.bankDetails.bankName}
                  </p>
                  <p className="text-muted-foreground">
                    Account: {selectedInstructor.bankDetails.accountNumber}
                  </p>
                  <p className="text-muted-foreground">
                    Holder: {selectedInstructor.bankDetails.accountHolder}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add a note for this payout..."
                    rows={2}
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsPayoutDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleProcessPayout}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Process Payout
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
