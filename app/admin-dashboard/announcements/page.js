"use client";

import { useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Megaphone,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  GraduationCap,
  UserCog,
  Calendar,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import {
  useAdminAnnouncements,
  useCreateAdminAnnouncement,
  useUpdateAdminAnnouncement,
  useDeleteAdminAnnouncement,
} from "@/lib/hooks/useAdmin";

export default function AnnouncementsPage() {
  const { showAlert } = useAlertDialog();
  const [searchQuery, setSearchQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    audience: "all",
    priority: "normal",
    scheduledAt: "",
  });

  // Fetch announcements
  const { data: announcementsResponse, isLoading } = useAdminAnnouncements({
    status: statusFilter !== "all" ? statusFilter : undefined,
    targetAudience: audienceFilter !== "all" ? audienceFilter : undefined,
    search: searchQuery || undefined,
  });

  const createMutation = useCreateAdminAnnouncement();
  const updateMutation = useUpdateAdminAnnouncement();
  const deleteMutation = useDeleteAdminAnnouncement();

  const announcements = announcementsResponse?.data?.announcements || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const announcementData = {
      title: formData.title,
      content: formData.content,
      targetAudience: formData.audience,
      priority: formData.priority,
      status: formData.scheduledAt ? "scheduled" : "published",
      scheduledAt: formData.scheduledAt || undefined,
    };

    if (editingAnnouncement) {
      updateMutation.mutate(
        { announcementId: editingAnnouncement._id, announcementData },
        {
          onSuccess: () => {
            setIsCreateOpen(false);
            setEditingAnnouncement(null);
            resetForm();
          },
        }
      );
    } else {
      createMutation.mutate(announcementData, {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      audience: "all",
      priority: "normal",
      scheduledAt: "",
    });
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.targetAudience,
      priority: announcement.priority,
      scheduledAt: announcement.scheduledAt
        ? new Date(announcement.scheduledAt).toISOString().slice(0, 16)
        : "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (announcement) => {
    showAlert({
      title: "Delete Announcement",
      description: `Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate(announcement._id);
      },
    });
  };

  const handleTogglePublish = (announcement) => {
    const newStatus = announcement.status === "published" ? "draft" : "published";
    updateMutation.mutate({
      announcementId: announcement._id,
      announcementData: { status: newStatus },
    });
  };

  const getAudienceBadge = (targetAudience) => {
    switch (targetAudience) {
      case "all":
        return (
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            Everyone
          </Badge>
        );
      case "students":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">
            <GraduationCap className="h-3 w-3" />
            Students
          </Badge>
        );
      case "instructors":
        return (
          <Badge variant="outline" className="gap-1 border-purple-500 text-purple-500">
            <UserCog className="h-3 w-3" />
            Instructors
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === "high") {
      return <Badge variant="destructive">High Priority</Badge>;
    }
    return null;
  };

  const publishedCount = announcements.filter((a) => a.status === "published").length;
  const draftCount = announcements.filter((a) => a.status === "draft").length;
  const scheduledCount = announcements.filter((a) => a.status === "scheduled").length;
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Announcements</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create and manage platform-wide announcements
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingAnnouncement(null);
              setFormData({
                title: "",
                content: "",
                audience: "all",
                priority: "normal",
                scheduleFor: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter announcement title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    rows={4}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter announcement content..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select
                      value={formData.audience}
                      onValueChange={(value) =>
                        setFormData({ ...formData, audience: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="instructors">Instructors Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Optional)</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledAt: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to publish immediately
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isMutating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isMutating}>
                    {isMutating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {editingAnnouncement
                      ? "Update"
                      : formData.scheduledAt
                      ? "Schedule"
                      : "Publish"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{announcements.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{publishedCount}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{scheduledCount}</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{draftCount}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
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
                  placeholder="Search announcements..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="instructors">Instructors</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || audienceFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first announcement"}
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement._id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{announcement.title}</h3>
                        {getPriorityBadge(announcement.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        {getAudienceBadge(announcement.targetAudience)}
                        {getStatusBadge(announcement.status)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(announcement.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {announcement.status === "scheduled" && announcement.scheduledAt && (
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scheduled: {format(new Date(announcement.scheduledAt), "MMM d, h:mm a")}
                          </span>
                        )}
                        {announcement.status === "published" && (
                          <>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {announcement.viewCount || 0} views
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {announcement.readCount || 0} read
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(announcement)}
                        >
                          {announcement.status === "published" ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(announcement)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
