"use client";

import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Trophy,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  Check,
  ChevronsUpDown,
  User,
  Loader2,
  GraduationCap,
  UserCog,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAlertDialog } from "@/components/ui/alert-dialog-provider";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  useAdminSuccessStories,
  useSearchUsersForSuccessStory,
  useCreateSuccessStory,
  useUpdateSuccessStory,
  useToggleSuccessStoryStatus,
  useDeleteSuccessStory,
} from "@/lib/hooks/useAdmin";
import { cn } from "@/lib/utils";

export default function SuccessStoriesPage() {
  const { showAlert } = useAlertDialog();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const debouncedSearch = useDebounce(userSearchQuery, 300);

  const [formData, setFormData] = useState({
    userId: "",
    selectedUser: null,
    achievement: "",
    testimonial: "",
    courseName: "",
    rating: 5,
  });

  // Fetch success stories
  const { data: storiesResponse, isLoading } = useAdminSuccessStories({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Search users
  const { data: usersResponse, isLoading: isSearching } = useSearchUsersForSuccessStory(debouncedSearch);

  const createMutation = useCreateSuccessStory();
  const updateMutation = useUpdateSuccessStory();
  const toggleMutation = useToggleSuccessStoryStatus();
  const deleteMutation = useDeleteSuccessStory();

  const successStories = storiesResponse?.data?.successStories || [];
  const searchedUsers = usersResponse?.data || [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.achievement.trim() || !formData.testimonial.trim() || !formData.courseName.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!editingStory && !formData.userId) {
      toast.error("Please select a user.");
      return;
    }

    const storyData = {
      achievement: formData.achievement,
      testimonial: formData.testimonial,
      courseName: formData.courseName,
      rating: formData.rating,
    };

    if (!editingStory) {
      storyData.userId = formData.userId;
    }

    if (editingStory) {
      updateMutation.mutate(
        { storyId: editingStory._id, storyData },
        {
          onSuccess: () => {
            setIsCreateOpen(false);
            setEditingStory(null);
            resetForm();
          },
        }
      );
    } else {
      createMutation.mutate(storyData, {
        onSuccess: () => {
          setIsCreateOpen(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      selectedUser: null,
      achievement: "",
      testimonial: "",
      courseName: "",
      rating: 5,
    });
    setUserSearchQuery("");
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      userId: story.user._id,
      selectedUser: story.user,
      achievement: story.achievement,
      testimonial: story.testimonial,
      courseName: story.courseName,
      rating: story.rating,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (story) => {
    showAlert({
      title: "Delete Success Story",
      description: `Are you sure you want to delete the success story for "${story.user.firstname} ${story.user.lastname}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate(story._id);
      },
    });
  };

  const handleToggleStatus = (story) => {
    toggleMutation.mutate(story._id);
  };

  const handleSelectUser = (user) => {
    setFormData({
      ...formData,
      userId: user._id,
      selectedUser: user,
    });
    setUserSearchOpen(false);
    setUserSearchQuery("");
  };

  const getRoleBadge = (roles) => {
    if (roles?.includes("LECTURER")) {
      return (
        <Badge variant="outline" className="gap-1 border-purple-500 text-purple-500">
          <UserCog className="h-3 w-3" />
          Instructor
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">
        <GraduationCap className="h-3 w-3" />
        Student
      </Badge>
    );
  };

  const activeCount = successStories.filter((s) => s.isActive).length;
  const inactiveCount = successStories.filter((s) => !s.isActive).length;
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || toggleMutation.isPending;

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1">Success Stories</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage testimonials from students and instructors
            </p>
          </div>
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) {
                setEditingStory(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Success Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStory ? "Edit Success Story" : "Add Success Story"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* User Selection */}
                {!editingStory && (
                  <div className="space-y-2">
                    <Label>Select User *</Label>
                    <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={userSearchOpen}
                          className="w-full justify-between"
                        >
                          {formData.selectedUser ? (
                            <span className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {formData.selectedUser.firstname} {formData.selectedUser.lastname}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Search for a user...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search by name or email..."
                            value={userSearchQuery}
                            onValueChange={setUserSearchQuery}
                          />
                          <CommandList>
                            {isSearching ? (
                              <div className="p-4 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              </div>
                            ) : searchedUsers.length === 0 ? (
                              <CommandEmpty>
                                {debouncedSearch.length < 2
                                  ? "Type at least 2 characters to search"
                                  : "No users found"}
                              </CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {searchedUsers.map((user) => (
                                  <CommandItem
                                    key={user._id}
                                    value={user._id}
                                    onSelect={() => handleSelectUser(user)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                        {user.firstname?.[0]}{user.lastname?.[0]}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                          {user.firstname} {user.lastname}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {user.email}
                                        </p>
                                      </div>
                                      {getRoleBadge(user.roles)}
                                      {formData.userId === user._id && (
                                        <Check className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Show selected user info when editing */}
                {editingStory && formData.selectedUser && (
                  <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                      {formData.selectedUser.firstname?.[0]}{formData.selectedUser.lastname?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formData.selectedUser.firstname} {formData.selectedUser.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.selectedUser.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="achievement">Achievement/Role *</Label>
                  <Input
                    id="achievement"
                    value={formData.achievement}
                    onChange={(e) =>
                      setFormData({ ...formData, achievement: e.target.value })
                    }
                    placeholder="e.g., SEE Graduate - GPA 3.95"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe their achievement or role
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                    placeholder="e.g., Complete SEE Preparation - All Subjects"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimonial">Testimonial *</Label>
                  <Textarea
                    id="testimonial"
                    rows={4}
                    value={formData.testimonial}
                    onChange={(e) =>
                      setFormData({ ...formData, testimonial: e.target.value })
                    }
                    placeholder="Enter their testimonial/feedback..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rating: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <SelectItem key={r} value={r.toString()}>
                          <span className="flex items-center gap-1">
                            {r} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingStory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{successStories.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{inactiveCount}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Success Stories List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : successStories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No success stories found</h3>
                <p className="text-muted-foreground">
                  Add your first success story to display on the homepage
                </p>
              </CardContent>
            </Card>
          ) : (
            successStories.map((story) => (
              <Card key={story._id} className={cn(!story.isActive && "opacity-60")}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      {/* User Avatar */}
                      {story.user?.userImage ? (
                        <img
                          src={story.user.userImage}
                          alt={`${story.user.firstname} ${story.user.lastname}`}
                          className="h-12 w-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-bold shrink-0">
                          {story.user?.firstname?.[0]}{story.user?.lastname?.[0]}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {story.user?.firstname} {story.user?.lastname}
                          </h3>
                          {getRoleBadge(story.user?.roles)}
                          {story.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>

                        <p className="text-sm text-primary font-medium mb-1">
                          {story.achievement}
                        </p>

                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          "{story.testimonial}"
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {story.courseName}
                          </span>
                          <span className="flex items-center gap-1">
                            {[...Array(story.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </span>
                          <span>
                            Added {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(story)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(story)}>
                          {story.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(story)}
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
