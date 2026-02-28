"use client";

import { useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  CreditCard,
  Search,
  Download,
  TrendingUp,
  Banknote,
  Calendar,
  Wallet,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { usePayments, usePaymentStats } from "@/lib/hooks/useAdmin";

/**
 * Format amount as Nepali Rupees
 */
function formatNPR(amount) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format compact currency (e.g., Rs. 1.5K)
 */
function formatCompact(amount) {
  if (amount >= 1000000) {
    return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}K`;
  }
  return `Rs. ${amount}`;
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7days");
  const [page, setPage] = useState(1);

  // Fetch payments with filters
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({
    page,
    limit: 20,
    search: searchQuery,
    status: statusFilter,
    method: methodFilter,
    type: typeFilter,
  });

  // Fetch payment stats
  const { data: statsData, isLoading: statsLoading } = usePaymentStats({
    period: dateRange,
  });

  const payments = paymentsData?.data?.payments || [];
  const pagination = paymentsData?.data?.pagination || { total: 0, totalPages: 1 };
  const stats = statsData?.data?.summary || {};
  const chartData = statsData?.data?.chartData || [];
  const methodBreakdown = statsData?.data?.methodBreakdown || {};

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 1);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method) => {
    const colors = {
      esewa: "bg-green-100 text-green-800",
      khalti: "bg-purple-100 text-purple-800",
      bank_transfer: "bg-blue-100 text-blue-800",
      cash: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    const labels = {
      esewa: "eSewa",
      khalti: "Khalti",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
      other: "Other",
    };
    return (
      <Badge variant="outline" className={colors[method] || "bg-gray-100"}>
        {labels[method] || method}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    if (type === "course") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <BookOpen className="h-3 w-3 mr-1" />
          Course
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700">
        <GraduationCap className="h-3 w-3 mr-1" />
        Tutoring
      </Badge>
    );
  };

  const handleExport = () => {
    // TODO: Implement export
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Payments</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track all platform transactions and revenue
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin-dashboard/payments/payouts">
              <Button variant="outline">
                <Wallet className="h-4 w-4 mr-2" />
                Payouts
              </Button>
            </Link>
            <Link href="/admin-dashboard/payments/refunds">
              <Button variant="outline">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Refunds
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className="h-5 w-5 text-green-600" />
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      {stats.platformFeePercentage || 15}% fee
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCompact(stats.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCompact(stats.platformEarnings || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Platform Earnings</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCompact(stats.pendingAmount || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">
                    {stats.completedTransactions || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Transactions ({dateRange === "7days" ? "7d" : dateRange === "30days" ? "30d" : "90d"})
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Revenue Overview
              </CardTitle>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-48 flex items-end justify-between gap-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <Skeleton className="w-full h-24 rounded-t" />
                    <Skeleton className="h-4 w-8 mt-2" />
                  </div>
                ))}
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-48 flex items-end justify-between gap-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t relative group cursor-pointer hover:bg-primary/80 transition-colors"
                      style={{
                        height: `${Math.max((item.amount / maxChartAmount) * 100, 5)}%`,
                        minHeight: "20px",
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatCompact(item.amount)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No revenue data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {["esewa", "khalti", "bank_transfer", "cash", "other"].map((method) => {
            const data = methodBreakdown[method] || { amount: 0, count: 0 };
            const labels = {
              esewa: "eSewa",
              khalti: "Khalti",
              bank_transfer: "Bank Transfer",
              cash: "Cash",
              other: "Other",
            };
            return (
              <Card key={method}>
                <CardContent className="p-4">
                  {statsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        {getMethodBadge(method)}
                        <span className="text-sm text-muted-foreground">
                          {data.count} txns
                        </span>
                      </div>
                      <p className="text-xl font-bold">
                        {formatNPR(data.amount)}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or transaction ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="tutoring">Tutoring</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="esewa">eSewa</SelectItem>
                  <SelectItem value="khalti">Khalti</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paymentsLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="hidden md:table-cell">Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Method</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-sm truncate max-w-[200px]">
                          {payment.item?.title || "Unknown"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatNPR(payment.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fee: {formatNPR(payment.platformFee)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getMethodBadge(payment.method)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {getTypeBadge(payment.type)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {payment.date
                          ? format(new Date(payment.date), "MMM d, yyyy h:mm a")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!paymentsLoading && payments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No transactions found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
