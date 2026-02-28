"use client";

import { useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  GraduationCap,
  UserCog,
  Loader2,
  AlertCircle,
  Mail,
  MailCheck,
  MailX,
} from "lucide-react";
import { format } from "date-fns";
import {
  useUsers,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
  useResendVerificationEmail,
} from "@/lib/hooks/useAdmin";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const { showConfirmation, showPrompt } = useAlertDialog();

  // Fetch users with filters
  const { data: usersResponse, isLoading, error } = useUsers({
    search: searchQuery,
    role: activeTab,
    status: statusFilter,
  });

  const suspendMutation = useSuspendUser();
  const activateMutation = useActivateUser();
  const deleteMutation = useDeleteUser();
  const resendVerificationMutation = useResendVerificationEmail();

  // Transform backend data
  const usersData = usersResponse?.data?.users || [];
  const counts = usersResponse?.data?.counts || { total: 0, students: 0, instructors: 0 };

  // Transform users to expected format
  const users = usersData.map((user) => ({
    id: user._id,
    name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
    email: user.email || "",
    phone: user.phone || "",
    role: user.roles?.includes("LECTURER") ? "instructor" : "student",
    status: user.isSuspended ? "suspended" : "active",
    isVerified: user.isVerified ?? true,
    joinedAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    avatar: user.userImage || null,
  }));

  const handleSuspend = async (userId, userName) => {
    const result = await showPrompt({
      title: "Suspend User",
      description: `Are you sure you want to suspend ${userName}? They will not be able to access their account.`,
      inputLabel: "Reason for suspension",
      inputPlaceholder: "Enter the reason for suspending this user...",
      inputRequired: true,
      confirmText: "Suspend",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (result.confirmed && result.value) {
      suspendMutation.mutate({ userId, reason: result.value });
    }
  };

  const handleActivate = (userId) => {
    activateMutation.mutate(userId);
  };

  const handleDelete = async (userId, userName) => {
    const confirmed = await showConfirmation({
      title: "Delete User",
      description: `Are you sure you want to permanently delete ${userName}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      deleteMutation.mutate(userId);
    }
  };

  const handleResendVerification = (userId) => {
    resendVerificationMutation.mutate(userId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "student":
        return (
          <Badge variant="outline" className="gap-1">
            <GraduationCap className="h-3 w-3" />
            Student
          </Badge>
        );
      case "instructor":
        return (
          <Badge variant="outline" className="gap-1 border-primary text-primary">
            <UserCog className="h-3 w-3" />
            Instructor
          </Badge>
        );
      default:
        return null;
    }
  };

  const getVerificationBadge = (isVerified) => {
    if (isVerified) {
      return (
        <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
          <MailCheck className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600">
        <MailX className="h-3 w-3" />
        Unverified
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-80 mb-6" />
          <Skeleton className="h-12 mb-6" />
          <Card>
            <CardContent className="p-0">
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="px-4 py-6 sm:py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load users</h3>
              <p className="text-muted-foreground">{error.message}</p>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Users</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage students and instructors
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              All Users ({counts.total})
            </TabsTrigger>
            <TabsTrigger value="student">
              Students ({counts.students})
            </TabsTrigger>
            <TabsTrigger value="instructor">
              Instructors ({counts.instructors})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.phone}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getVerificationBadge(user.isVerified)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {format(user.joinedAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin-dashboard/users/${user.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {!user.isVerified && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleResendVerification(user.id)}
                                className="text-orange-600"
                                disabled={resendVerificationMutation.isPending}
                              >
                                {resendVerificationMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4 mr-2" />
                                )}
                                Resend Verification
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleSuspend(user.id, user.name)}
                              className="text-orange-600"
                              disabled={suspendMutation.isPending}
                            >
                              {suspendMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Ban className="h-4 w-4 mr-2" />
                              )}
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleActivate(user.id)}
                              className="text-green-600"
                              disabled={activateMutation.isPending}
                            >
                              {activateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-destructive"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
